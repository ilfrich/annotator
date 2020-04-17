from flask import render_template
from config import is_debug


def register_endpoints(app):
    """
    Registers all the endpoints used by the frontend to deliver the index.html in all cases.
    :param app: the flask app
    """
    @app.route("/", methods=["GET"])
    @app.route("/projects/<project_id>", methods=["GET"])
    @app.route("/projects/<project_id>/images/<image_id>", methods=["GET"])
    def get_index(project_id=None, image_id=None):
        """
        Each call to the API, which doesn't start with `/api` will be covered by this function providing the index.html
        to the caller. The index.html will load the index.js in the browser, which will render the frontend. The
        frontend will then decide what view to render. The backend is not responsible for that.

        **IMPORTANT**
        This function needs to be updated whenever new frontend routes are added to the React router. You can provide
        multiple @app.route(..) lines for multiple frontend routes that all just return the frontend (because the
        frontend has it's own router which decides what page to render)

        :return: the index.html as file (basically delivering the whole frontend)
        """
        return render_template("index.html")

    # prevent caching of the frontend during development
    if is_debug():
        @app.after_request
        def add_header(r):
            """
            Add headers to both force latest IE rendering engine or Chrome Frame,
            and also to cache the rendered page for 10 minutes.
            """
            r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            r.headers["Pragma"] = "no-cache"
            r.headers["Expires"] = "0"
            r.headers['Cache-Control'] = 'public, max-age=0'
            return r
