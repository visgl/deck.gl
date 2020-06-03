import os
from os.path import relpath, realpath, join, dirname
import sys
import tempfile
import time
import webbrowser

import jinja2

from ..frontend_semver import DECKGL_SEMVER


def convert_js_bool(py_bool):
    if type(py_bool) != bool:
        return py_bool
    return "true" if py_bool else "false"


in_google_collab = "google.colab" in sys.modules


TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "./templates/")
j2_env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATES_PATH), trim_blocks=True)
CDN_URL = "https://cdn.jsdelivr.net/npm/@deck.gl/jupyter-widget@{}/dist/index.js".format(DECKGL_SEMVER)


def cdn_picker(offline=False):
    # Support hot-reloading
    dev_port = os.getenv("PYDECK_DEV_PORT")
    if dev_port:
        print('pydeck running in development mode, expecting @deck.gl/jupyter-widget served at {}'.format(dev_port))
        return (
            "<script type='text/javascript' src='http://localhost:{dev_port}/dist/index.js'></script>\n"
            "<script type='text/javascript' src='http://localhost:{dev_port}/dist/index.js.map'></script>\n"
        ).format(dev_port=dev_port)
    if offline:
        RELPATH_TO_BUNDLE = "../nbextension/static/index.js"
        with open(join(dirname(__file__), RELPATH_TO_BUNDLE), "r", encoding="utf-8") as file:
            js = file.read()
        return "<script type='text/javascript'>{}</script>".format(js)

    return "<script src='{}'></script>".format(CDN_URL)


def render_json_to_html(
    json_input,
    mapbox_key=None,
    google_maps_key=None,
    tooltip=True,
    css_background_color=None,
    custom_libraries=None,
    offline=False,
):
    js = j2_env.get_template("index.j2")
    html_str = js.render(
        mapbox_key=mapbox_key,
        google_maps_key=google_maps_key,
        json_input=json_input,
        deckgl_jupyter_widget_bundle=cdn_picker(offline=offline),
        tooltip=convert_js_bool(tooltip),
        css_background_color=css_background_color,
        custom_libraries=custom_libraries,
    )
    return html_str


def display_html(filename=None, height=500, width=500):
    """Converts HTML into a temporary file and opens it in the system browser."""
    url = "file://{}".format(filename)
    # Hack to prevent blank page
    time.sleep(0.5)
    webbrowser.open(url)


def check_directory_exists(path):
    return os.path.isdir(path) and os.path.exists(path)


def open_named_or_temporary_file(pathname=None):
    if pathname and not pathname.endswith("/"):
        filename = add_html_extension(pathname)
        return open(filename, "w+")
    directory = make_directory_if_not_exists(pathname) or os.path.curdir
    return tempfile.NamedTemporaryFile(prefix="pydeck", mode="w+", suffix=".html", dir=directory, delete=False)


def make_directory_if_not_exists(path):
    if path and not os.path.exists(path):
        os.makedirs(path)
    return path


def add_html_extension(fname):
    SUFFIX = ".html"
    if fname.endswith(SUFFIX):
        return str(fname)
    return str(fname + ".html")


def deck_to_html(
    deck_json,
    mapbox_key=None,
    google_maps_key=None,
    filename=None,
    open_browser=False,
    notebook_display=False,
    css_background_color=None,
    iframe_height=500,
    iframe_width=500,
    tooltip=True,
    custom_libraries=None,
    as_string=False,
    offline=False,
):
    """Converts deck.gl format JSON to an HTML page"""
    html = render_json_to_html(
        deck_json,
        mapbox_key=mapbox_key,
        google_maps_key=google_maps_key,
        tooltip=tooltip,
        css_background_color=css_background_color,
        custom_libraries=custom_libraries,
        offline=offline,
    )

    if as_string:
        return html

    f = None
    try:
        f = open_named_or_temporary_file(filename)
        f.write(html)
    finally:
        if f is None:
            raise Exception("pydeck could not write a file")
        f.close()
    if open_browser:
        display_html(realpath(f.name))
    if notebook_display:
        from IPython.display import display  # noqa

        if in_google_collab:
            from IPython.display import HTML, Javascript  # noqa

            js_height_snippet = "google.colab.output.setIframeHeight(0, true, {maxHeight: %s})" % iframe_height
            display(Javascript(js_height_snippet))
            display(HTML(html))
        else:
            from IPython.display import IFrame  # noqa

            notebook_to_html_path = relpath(f.name)
            display(IFrame(os.path.join("./", notebook_to_html_path), width=iframe_width, height=iframe_height))  # noqa

    return realpath(f.name)
