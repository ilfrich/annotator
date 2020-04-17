_EXTENSIONS = {
    "image/png": ".png",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",  # secondary fallback
}


class ImageAdapter:
    @staticmethod
    def get_mime_type(file_name):
        for mimetype in _EXTENSIONS:
            if _EXTENSIONS[mimetype] in file_name:
                return mimetype
        return None

    @staticmethod
    def get_image_extensions():
        return _EXTENSIONS
