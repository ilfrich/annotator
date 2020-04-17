from flask import Flask
from pbu import Logger
from config import load_config, get_log_folder, get_mongodb_config
from storage.project_store import ProjectStore
from storage.image_store import ImageStore
from storage.annotation_store import AnnotationStore
import api.static_api as static_api
import api.project_api as project_api
import api.annotation_api as annotation_api
import api.image_api as image_api

if __name__ == "__main__":
    logger = Logger("MAIN", log_folder=get_log_folder())
    logger.info("==========================================")
    logger.info("           Starting application")
    logger.info("==========================================")

    # load config from .env file
    config = load_config()

    # ---- database and stores ----
    # fetch mongo config
    mongo_url, mongo_db = get_mongodb_config()

    # initialise stores
    stores = {
        "projects": ProjectStore(mongo_url=mongo_url, mongo_db=mongo_db, collection_name="projects"),
        "images": ImageStore(mongo_url=mongo_url, mongo_db=mongo_db, collection_name="images"),
        "annotations": AnnotationStore(mongo_url=mongo_url, mongo_db=mongo_db, collection_name="annotations"),
    }

    # ---- API ----
    # create flask app
    app = Flask(__name__)
    # register endpoints
    static_api.register_endpoints(app)
    project_api.register_endpoints(app, stores)
    image_api.register_endpoints(app, stores)
    annotation_api.register_endpoints(app, stores)

    # start flask app
    app.run(host='0.0.0.0', port=5555, debug=config["IS_DEBUG"])
