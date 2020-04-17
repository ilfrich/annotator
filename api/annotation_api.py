from flask import jsonify, request, abort
from pbu import list_to_json
from storage.annotation_store import Annotation


def register_endpoints(app, stores):

    annotation_store = stores["annotations"]
    project_store = stores["projects"]
    image_store = stores["images"]

    def _get_project(project_id):
        project = project_store.get(project_id)
        if project is None:
            abort(404)
        return project

    def _get_image(image_id):
        image = image_store.get(image_id)
        if image is None:
            abort(404)
        return image

    @app.route("/api/projects/<project_id>/images/<image_id>/annotations", methods=["GET"])
    def get_annotation_for_image(project_id, image_id):
        # parents
        _ = _get_project(project_id)
        image = _get_image(image_id)
        # return annotation
        annotation = annotation_store.get_by_image(image_id)
        if image.num_frames is None:
            if len(annotation) == 0:
                return jsonify({})
            else:
                return jsonify(annotation[0].to_json())
        else:
            return jsonify(list_to_json(annotation))

    @app.route("/api/projects/<project_id>/images/<image_id>/annotations", methods=["POST"])
    def create_annotations(project_id, image_id):
        # parents
        project = _get_project(project_id)
        _ = _get_image(image_id)
        # parse body and save annotation
        body = request.get_json()
        instance = Annotation.from_json(body)
        instance.image_id = image_id
        instance.project_id = project_id
        annotation_id = annotation_store.create(instance.to_json())
        # update project
        project.annotation_count += 1
        project_store.update_counts(project)
        return jsonify(annotation_store.get(annotation_id).to_json())

    @app.route("/api/projects/<project_id>/images/<image_id>/annotations/<annotation_id>", methods=["POST"])
    def update_annotation(project_id, image_id, annotation_id):
        _ = _get_project(project_id)
        _ = _get_image(image_id)
        annotation = annotation_store.get(annotation_id)
        if annotation is None:
            abort(404)
        annotation = Annotation.from_json(request.get_json())
        annotation_store.update_full(annotation)
        return jsonify(annotation.to_json())

    @app.route("/api/projects/<project_id>/images/<image_id>/annotations/<annotation_id>", methods=["DELETE"])
    def delete_annotation(project_id, image_id, annotation_id):
        # parents
        project = _get_project(project_id)
        _ = _get_image(image_id)
        # check annotation exists
        annotation = annotation_store.get(annotation_id)
        if annotation is None:
            abort(404)
        # delete annotation
        annotation_store.delete(annotation_id)
        # update project
        project.annotation_count -= 1
        project_store.update_counts(project)
        return jsonify({})
