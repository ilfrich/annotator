import os
import shutil
from config import get_image_folder
from flask import jsonify, request, abort
from pbu import list_to_json
from storage.project_store import Project


def register_endpoints(app, stores):

    project_store = stores["projects"]
    image_store = stores["images"]
    annotation_store = stores["annotations"]

    @app.route("/api/projects", methods=["GET"])
    def get_projects():
        return jsonify(list_to_json(project_store.get_all()))

    @app.route("/api/projects", methods=["POST"])
    def create_project():
        body = request.get_json()
        instance = Project.from_json(body)
        project_id = project_store.create(instance.to_json())
        return jsonify(project_store.get(project_id).to_json())

    @app.route("/api/projects/<project_id>", methods=["DELETE"])
    def delete_project(project_id):
        project_store.delete(project_id)
        # delete images
        images = image_store.get_by_project(project_id)
        for image in images:
            image_store.delete(image.id)
        # delete annotations
        annotations = annotation_store.get_by_project(project_id)
        for annotation in annotations:
            annotation_store.delete(annotation.id)
        # delete image folder
        project_image_folder = os.path.join(get_image_folder(), project_id)
        if os.path.isdir(project_image_folder):
            shutil.rmtree(project_image_folder)
        return jsonify({
            "projectId": project_id,
            "deleted": True,
        })

    @app.route("/api/projects/<project_id>/annotation-types", methods=["POST"])
    def update_project_annotation_types(project_id):
        existing = project_store.get(project_id)
        if existing is None:
            abort(404)

        body = request.get_json()
        project_store.update_annotation_types(project_id, body["annotationTypes"])
        return jsonify(project_store.get(project_id).to_json())

    @app.route("/api/projects/<project_id>/settings", methods=["POST"])
    def import_project_settings(project_id):
        existing = project_store.get(project_id)
        if existing is None:
            abort(404)
        body = request.get_json()
        settings = body["settings"]
        import_mapping = body["importMapping"]["annotationTypes"]
        final_annotation_types = existing.annotation_types

        # handle existing annotations
        for annotation_type in import_mapping:
            if import_mapping[annotation_type] != 1:
                # will be migrated or just removed
                del final_annotation_types[annotation_type]

            # handle migration of annotation types
            if import_mapping[annotation_type] == -1:
                # remove
                annotation_store.remove_annotation_type(project_id, annotation_type)
            elif import_mapping[annotation_type] == 1:
                # keep this
                pass
            else:
                # migrate annotations
                annotation_store.migrate_annotation_type(project_id, annotation_type, import_mapping[annotation_type])

        # add all the new annotation types
        for annotation_type in settings["annotationTypes"]:
            final_annotation_types[annotation_type] = settings["annotationTypes"][annotation_type]

        # update project
        project_store.update_annotation_types(project_id, final_annotation_types)
        return jsonify(project_store.get(project_id).to_json())