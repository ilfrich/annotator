import os
import PIL.Image
import zipfile
from operator import itemgetter
from config import get_image_folder
from flask import jsonify, request, abort, send_file
from pbu import list_to_json
from storage.image_store import Image
from data.image_adapter import ImageAdapter


def get_image_path(image, image_num=None):
    if image.num_frames is None:
        # normal image
        return os.path.join(get_image_folder(),
                            image.project_id,
                            "{}{}".format(image.id, ImageAdapter.get_image_extensions()[image.content_type]))
    frame = image_num
    if frame is None:
        frame = 0
    return os.path.join(get_image_folder(),
                        image.project_id,
                        image.id,
                        "{}{}".format(frame, ImageAdapter.get_image_extensions()[image.content_type]))


def _ensure_project_image_exists(project_id):
    # check image folders
    image_folder = get_image_folder()
    if not os.path.isdir(image_folder):
        os.mkdir(image_folder)
    project_folder = os.path.join(image_folder, project_id)
    if not os.path.isdir(project_folder):
        os.mkdir(project_folder)


def _upload_frame_set(image_store, project_store, project, label, zip_file):
    project_id = project.id
    _ensure_project_image_exists(project_id)

    image = Image()
    image.label = label
    image.original_file_names = {}
    image.project_id = project_id
    image_id = image_store.create(image.to_json())
    image.id = image_id

    # save zip file in project folder
    zip_path = os.path.join(get_image_folder(), project_id, "{}.zip".format(image_id))
    zip_file.save(zip_path)

    # extract zip file
    extract_dir = os.path.join(get_image_folder(), project_id, image_id)
    os.mkdir(extract_dir)
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_dir)

    # capture list of files and mime types
    mime_types = {}
    file_names = []
    for file in os.listdir(extract_dir):
        file_names.append(file)
        current_mime_type = ImageAdapter.get_mime_type(file)
        if current_mime_type is not None:
            if current_mime_type not in mime_types:
                mime_types[current_mime_type] = 0
            mime_types[current_mime_type] += 1

    # get mime type and file extension
    all_types = []
    for mime_type in mime_types:
        all_types.append({"type": mime_type, "count": mime_types[mime_type]})
    sorted_types = list(sorted(all_types, key=lambda x: x["count"], reverse=True))
    if len(sorted_types) == 0:
        raise ValueError("Zip file contains no valid images")
    mime_type = sorted_types[0]["type"]
    file_extension = ImageAdapter.get_image_extensions()[mime_type]

    # filter out non images
    file_names = list(filter(lambda x: ImageAdapter.get_mime_type(x) == mime_type, file_names))

    # update meta image
    image.content_type = mime_type
    image.num_frames = len(file_names)
    image_store.update_full(image)

    # sort by length and then file name
    for index, frame in enumerate(sorted(list(map(lambda fn: (len(fn), fn), file_names)), key=itemgetter(0, 1))):
        # rename into 0.jpg, 1.jpg, ...
        os.rename(os.path.join(extract_dir, frame[1]), os.path.join(extract_dir, "{}{}".format(index, file_extension)))
        image.original_file_names[str(index)] = frame[1]

    # get image dimensions
    stored_image = PIL.Image.open(get_image_path(image, 0))
    width, height = stored_image.size
    image_store.update_dimension(image.id, width, height)
    image_store.update_original_file_names(image.id, image.original_file_names)

    image.width = width
    image.height = height

    # update project
    project.image_count += 1
    project_store.update_counts(project)

    # clean up
    os.unlink(zip_path)
    return image


def _upload_single_image(image_store, project_store, project, label, image_file):
    project_id = project.id
    _ensure_project_image_exists(project_id)

    image = Image()
    image.label = label
    image.original_file_names = image_file.filename
    image.project_id = project_id
    image.content_type = image_file.mimetype

    # create meta image
    image_id = image_store.create(image.to_json())
    image.id = image_id

    image_path = get_image_path(image)

    # store file
    image_file.save(image_path)

    # update meta information
    stored_image = PIL.Image.open(image_path)
    width, height = stored_image.size
    image_store.update_dimension(image.id, width, height)

    # update project
    project.image_count += 1
    project_store.update_counts(project)
    # return meta image
    return image_store.get(image_id)


def register_endpoints(app, stores):
    project_store = stores["projects"]
    image_store = stores["images"]
    annotation_store = stores["annotations"]

    def _get_project(project_id):
        project = project_store.get(project_id)
        if project is None:
            abort(404)
        return project

    @app.route("/image/<project_id>/<image_id>", methods=["GET"])
    def get_image_blob(project_id, image_id):
        _ = _get_project(project_id)
        image = image_store.get(image_id)
        if image is None:
            abort(404)
        image_path = get_image_path(image)
        if not os.path.exists(image_path):
            abort(404)
        return send_file(image_path)

    @app.route("/image/<project_id>/<image_id>/<int:frame_num>", methods=["GET"])
    def get_image_frame_blob(project_id, image_id, frame_num):
        _ = _get_project(project_id)
        image = image_store.get(image_id)
        if image is None:
            abort(404)
        if image.num_frames is None or image.num_frames - 1 < frame_num:
            abort(400)
        image_path = get_image_path(image, frame_num)
        if not os.path.exists(image_path):
            abort(404)
        return send_file(image_path)

    @app.route("/api/projects/<project_id>/images", methods=["GET"])
    def get_images(project_id):
        _ = _get_project(project_id)
        return jsonify(list_to_json(image_store.get_by_project(project_id)))

    @app.route("/api/projects/<project_id>/images/<image_id>", methods=["GET"])
    def get_image(project_id, image_id):
        _ = _get_project(project_id)
        img = image_store.get(image_id)
        if img is None:
            abort(404)
        return jsonify(img.to_json())

    @app.route("/api/projects/<project_id>/images", methods=["POST"])
    def upload_image(project_id):
        # check project
        project = _get_project(project_id)
        if "file" not in request.files:
            abort(400)
        new_image = request.files["file"]
        label = request.form.get("label")
        if new_image.mimetype in ["application/zip", "application/x-zip-compressed"]:
            # uploading frame set
            return jsonify(_upload_frame_set(image_store, project_store, project, label, new_image).to_json())
        # upload single image
        return jsonify(_upload_single_image(image_store, project_store, project, label, new_image).to_json())

    @app.route("/api/projects/<project_id>/images/<image_id>", methods=["DELETE"])
    def delete_image(project_id, image_id):
        project = _get_project(project_id)
        image = image_store.get(image_id)
        if image is None:
            abort(404)
        # delete image
        image_store.delete(image_id)
        if image.num_frames is not None:
            for i in range(0, image.num_frames):
                os.unlink(get_image_path(image, i))
            os.rmdir(os.path.join(get_image_folder(), project_id, image.id))
        else:
            os.remove(get_image_path(image))
        # delete annotations
        annotations = annotation_store.get_by_image(image_id)
        if annotations is not None:
            if isinstance(annotations, list):
                for anno in annotations:
                    annotation_store.delete(anno.id)
            else:
                annotation_store.delete(annotations.id)
        # update project
        project.image_count -= 1
        project_store.update_counts(project)
        return jsonify({})

    @app.route("/api/projects/<project_id>/images/<image_id>", methods=["POST"])
    def update_image_label(project_id, image_id):
        _ = _get_project(project_id)
        image = image_store.get(image_id)
        if image is None:
            abort(404)

        body = request.get_json()
        if "label" not in body:
            abort(400)

        image_store.update_label(image_id, body["label"])
        return jsonify(image_store.get(image_id).to_json())
