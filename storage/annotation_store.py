from pbu import AbstractMongoStore


class Annotation:
    """
    Object class representing a document in this database collection.
    """

    def __init__(self):
        self.project_id = None
        self.image_id = None
        self.shapes = []
        self.id = None
        self.frame_num = None

    def to_json(self):
        """
        Serialises the current instance into JSON
        :return: a dictionary containing the fields and values of this instance
        """
        result = {}
        if self.project_id is not None:
            result["projectId"] = self.project_id
        if self.image_id is not None:
            result["imageId"] = self.image_id
        if self.shapes is not None:
            result["shapes"] = self.shapes
        if self.frame_num is not None:
            result["frameNum"] = self.frame_num
        if self.id is not None:
            result["_id"] = str(self.id)

        return result

    @staticmethod
    def from_json(json):
        """
        Method to de-serialise a row from a JSON object
        :param json: the JSON object represented as dictionary
        :return: a representation of a row object
        """
        result = Annotation()
        if "projectId" in json:
            result.project_id = json["projectId"]
        if "imageId" in json:
            result.image_id = json["imageId"]
        if "shapes" in json:
            result.shapes = json["shapes"]
        if "frameNum" in json:
            result.frame_num = json["frameNum"]
        if "_id" in json:
            result.id = str(json["_id"])
        return result


class AnnotationStore(AbstractMongoStore):
    """
    Database store representing a MongoDB collection
    """
    def __init__(self, mongo_url, mongo_db, collection_name):
        super().__init__(mongo_url, mongo_db, collection_name, Annotation, 1)

    def get_by_image(self, image_id, frame_num=None):
        if frame_num is None:
            return super().query({"imageId": image_id})
        return super().query({"imageId": image_id, "frameNum": frame_num})

    def get_by_project(self, project_id):
        return super().query({"projectId": project_id})
