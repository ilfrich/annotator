"""
This script allows to copy one or multiple projects from one annotator instance to another. Simply run this program with
python3 after installing `requests`
"""
import requests
import sys
import os
import copy
import zipfile


MIGRATION_DIR = os.path.join(os.path.dirname(__file__), "_migration")


def _read_projects(source_api):
    return requests.get("{}/api/projects".format(source_api)).json()


def _get_project_configuration(source_server):
    print("\nReading projects\n")
    project_list = _read_projects(source_server)

    print("Projects\n========")
    print("0  -  ALL Projects")
    for index, project in enumerate(project_list):
        print("{}  -  {}".format(index + 1, project["name"]))

    print("\nIf you want to select multiple projects, provide their number separated by space, e.g. '3 5 6'\n")
    project_indexes = input("Projects to migrated: ")
    if project_indexes == "0":
        projects = list(range(1, len(project_list) + 1))
    else:
        projects = []
        project_index_list = project_indexes.split(" ")
        for item in project_index_list:
            projects.append(int(item))

    return projects


def _get_configuration():
    source_server = input("Please provide the URL to the source server: ")
    if source_server == "":
        source_server = "http://localhost:5555"
    target_server = input("Please provide the URL to the target server: ")
    if target_server == "":
        target_server = "http://localhost:5556"
    projects = _get_project_configuration(source_server)
    return source_server, target_server, projects


def _create_project(target_api, project):
    new_project = copy.deepcopy(project)
    # reset counters and remove id
    del new_project["_id"]
    new_project["image_count"] = 0
    new_project["annotation_count"] = 0
    # create project
    created_project = requests.post("{}/api/projects".format(target_api), json=new_project).json()
    return created_project


def _save_file(image_response, image_path):
    if image_response.status_code == 200:
        with open(image_path, 'wb') as f:
            f.write(image_response.content)
        return image_path
    raise ConnectionError("Could not fetch image from source API")


def _clean_migration_dir():
    for root, dirs, files in os.walk(MIGRATION_DIR):
        for f in files:
            combined_path = os.path.join(root, f)
            os.unlink(combined_path)


def migration_annotations(source, target, source_image, target_image):
    # get annotations from source
    annotations = requests.get("{}/api/projects/{}/images/{}/annotations".format(source, source_image["projectId"],
                                                                                 source_image["_id"])).json()

    if isinstance(annotations, dict):
        annotations = [annotations]

    for annotation in annotations:
        if "_id" not in annotation:
            # no annotations available
            return

        # clean up data and map to target system
        del annotation["_id"]
        annotation["imageId"] = target_image["_id"]
        annotation["projectId"] = target_image["projectId"]

        # save annotations for new image
        res = requests.post("{}/api/projects/{}/images/{}/annotations".format(target, target_image["projectId"],
                                                                              target_image["_id"]), json=annotation)
        if res.status_code != 200:
            raise ConnectionError("Failed to save annotations")


def _compile_frame_set(source, source_image):
    print(f"    - Compiling frame set for '{source_image['label']}' - this may take a while")
    temp_dir = os.path.join(MIGRATION_DIR, "_temp")
    if not os.path.exists(temp_dir):
        os.mkdir(temp_dir)
    source_files = []
    for index in source_image["originalFileNames"]:
        r = requests.get("{}/image/{}/{}/{}".format(source, source_image["projectId"], source_image["_id"], index))
        source_files.append(_save_file(r, os.path.join(temp_dir, source_image["originalFileNames"][index])))

    zip_file = os.path.join(temp_dir, "temp.zip")
    zipf = zipfile.ZipFile(zip_file, "w", zipfile.ZIP_DEFLATED)
    for src_file in source_files:
        zipf.write(src_file, os.path.basename(src_file))
    zipf.close()
    for src_file in source_files:
        os.unlink(src_file)
    return temp_dir, zip_file


def migrate_images(source, target, source_project, target_project):
    # get images from source
    source_images = requests.get("{}/api/projects/{}/images".format(source, source_project["_id"])).json()
    for image in source_images:
        print("  - Processing image '{}'".format(image["label"]))
        if "numFrames" in image:
            # frame set
            temp_dir, zip_path = _compile_frame_set(source, image)
            fp = open(zip_path, "rb")
            multipart_form_data = {
                "file": (os.path.basename(zip_path), fp, "application/zip"),
            }
            multipart_data = {
                "label": image["label"],
            }
            new_image = requests.post("{}/api/projects/{}/images".format(target, target_project["_id"]),
                                      files=multipart_form_data, data=multipart_data).json()
            # clean up
            fp.close()
            os.unlink(zip_path)
            # migrate annotations
            migration_annotations(source, target, image, new_image)
        else:
            # single image
            r = requests.get("{}/image/{}/{}".format(source, source_project["_id"], image["_id"]))

            file_path = _save_file(r, os.path.join(MIGRATION_DIR, image["originalFileNames"]))
            fp = open(file_path, "rb")
            multipart_form_data = {
                "file": (image["originalFileNames"], fp, image["contentType"]),
            }
            multipart_data = {
                "label": image["label"],
            }
            new_image = requests.post("{}/api/projects/{}/images".format(target, target_project["_id"]),
                                      files=multipart_form_data, data=multipart_data).json()
            fp.close()
            os.unlink(file_path)
            migration_annotations(source, target, image, new_image)


def migrate_projects(source, target, project_list):
    source_projects = _read_projects(source)
    # stores list of source projects
    projects = {}
    # map source project _id to target _id
    project_id_mapping = {}
    for index in project_list:
        project = source_projects[index - 1]
        projects[project["_id"]] = project

    print(f"Processing {len(projects)} projects")
    for project_id in projects:
        print(f"- Migrating project '{projects[project_id]['name']}'")
        new_project = _create_project(target, projects[project_id])
        project_id_mapping[project_id] = new_project["_id"]

        migrate_images(source, target, projects[project_id], new_project)


if __name__ == "__main__":
    print(f"    Using directory {MIGRATION_DIR} for migration")
    _clean_migration_dir()

    arguments = sys.argv
    arguments_length = len(arguments)
    if arguments_length == 1:
        # ask for everything
        s, t, p = _get_configuration()
    elif arguments_length >= 3:
        # source and target provided
        s = arguments[1]
        t = arguments[2]

    if arguments_length == 3:
        p = _get_project_configuration(s)
    elif arguments_length == 4 and arguments[3] == "0":
        all_p = _read_projects(s)
        p = list(range(1, len(all_p) + 1))

    if not os.path.exists(MIGRATION_DIR):
        os.mkdir(MIGRATION_DIR)

    print("\n\n-> Start Migration\n")
    migrate_projects(s, t, p)

    _clean_migration_dir()
    print("\n\n-> MIGRATION SUCCESSFULLY COMPLETED\n")
