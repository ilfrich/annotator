from pbumongo import AbstractMongoStore


class Project:
    """
    Object class representing a document in this database collection.
    """

    def __init__(self):
        self.name = None
        self.id = None
        self.image_count = 0
        self.annotation_count = 0
        self.annotation_types = {}

    def to_json(self):
        """
        Serialises the current instance into JSON
        :return: a dictionary containing the fields and values of this instance
        """
        result = {
            "imageCount": self.image_count,
            "annotationCount": self.annotation_count,
            "annotationTypes": self.annotation_types,
        }
        if self.name is not None:
            result["name"] = self.name
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
        result = Project()
        if "name" in json:
            result.name = json["name"]
        if "imageCount" in json:
            result.image_count = json["imageCount"]
        if "annotationCount" in json:
            result.annotation_count = json["annotationCount"]
        if "annotationTypes" in json:
            result.annotation_types = json["annotationTypes"]
        if "_id" in json:
            result.id = str(json["_id"])
        return result


class ProjectStore(AbstractMongoStore):
    """
    Database store representing a MongoDB collection
    """

    def __init__(self, mongo_url, mongo_db, collection_name):
        super().__init__(mongo_url, mongo_db, collection_name, Project, 1)

    def update_counts(self, project):
        return super().update_one(AbstractMongoStore.id_query(project.id),
                                  AbstractMongoStore.set_update(["imageCount","annotationCount"],
                                                                [project.image_count,  project.annotation_count]))

    def update_annotation_types(self, project_id, annotation_types):
        return super().update_one(AbstractMongoStore.id_query(project_id),
                                  AbstractMongoStore.set_update("annotationTypes", annotation_types))
