from pbu import AbstractMongoStore


class Image:
    """
    Object class representing a document in this database collection.
    """

    def __init__(self):
        self.project_id = None
        self.id = None
        self.content_type = None
        self.width = 0
        self.height = 0
        self.num_frames = None
        self.label = None
        self.original_file_names = None

    def to_json(self):
        """
        Serialises the current instance into JSON
        :return: a dictionary containing the fields and values of this instance
        """
        result = {
            "width": self.width,
            "height": self.height,
        }
        if self.project_id is not None:
            result["projectId"] = self.project_id
        if self.content_type is not None:
            result["contentType"] = self.content_type
        if self.id is not None:
            result["_id"] = str(self.id)
        if self.num_frames is not None:
            result["numFrames"] = self.num_frames
        if self.label is not None:
            result["label"] = self.label
        if self.original_file_names is not None:
            result["originalFileNames"] = self.original_file_names

        return result

    @staticmethod
    def from_json(json):
        """
        Method to de-serialise a row from a JSON object
        :param json: the JSON object represented as dictionary
        :return: a representation of a row object
        """
        result = Image()
        if "projectId" in json:
            result.project_id = json["projectId"]
        if "width" in json:
            result.width = json["width"]
        if "height" in json:
            result.height = json["height"]
        if "contentType" in json:
            result.content_type = json["contentType"]
        if "numFrames" in json:
            result.num_frames = json["numFrames"]
        if "label" in json:
            result.label = json["label"]
        if "originalFileNames" in json:
            result.original_file_names = json["originalFileNames"]
        if "_id" in json:
            result.id = str(json["_id"])
        return result


class ImageStore(AbstractMongoStore):
    """
    Database store representing a MongoDB collection
    """
    def __init__(self, mongo_url, mongo_db, collection_name):
        super().__init__(mongo_url, mongo_db, collection_name, Image, 1)

    def get_by_project(self, project_id):
        return super().query({"projectId": project_id})

    def update_dimension(self, image_id, width, height):
        return super().update_one(AbstractMongoStore.id_query(image_id),
                                  AbstractMongoStore.set_update(["width", "height"], [width, height]))

    def update_original_file_names(self, image_id, original_file_names):
        return super().update_one(AbstractMongoStore.id_query(image_id),
                                  AbstractMongoStore.set_update("originalFileNames", original_file_names))

    def update_label(self, image_id, new_label):
        return super().update_one(AbstractMongoStore.id_query(image_id),
                                  AbstractMongoStore.set_update("label", new_label))
