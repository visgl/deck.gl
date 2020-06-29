import html
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
        print("pydeck running in development mode, expecting @deck.gl/jupyter-widget served at {}".format(dev_port))
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


def display_html(filename, height=500, width=500):
    """Converts HTML into a temporary file and opens it in the system browser."""
    url = "file://{}".format(filename)
    # Hack to prevent blank page
    time.sleep(0.5)
    webbrowser.open(url)


def iframe_with_srcdoc(html_str, width="100%", height=500):
    iframe = f"""<iframe src="about:blank" srcdoc="{html.escape(html_str)}" width={width} height={height}></iframe>"""
    from IPython.display import HTML  # noqa
    return HTML(iframe)


def render_for_collab(html_str, iframe_height):
    js_height_snippet = "google.colab.output.setIframeHeight(0, true, {maxHeight: %s})" % iframe_height
    display(Javascript(js_height_snippet))  # noqa
    display(HTML(html_str))  # noqa


def deck_to_html(
    deck_json,
    mapbox_key=None,
    google_maps_key=None,
    filename=None,
    open_browser=False,
    jupyter_display=False,
    css_background_color=None,
    iframe_height=500,
    iframe_width='100%',
    tooltip=True,
    custom_libraries=None,
    as_string=True,
    offline=False,
):
    """Converts deck.gl format JSON to an HTML page"""
    html_str = render_json_to_html(
        deck_json,
        mapbox_key=mapbox_key,
        google_maps_key=google_maps_key,
        tooltip=tooltip,
        css_background_color=css_background_color,
        custom_libraries=custom_libraries,
        offline=offline,
    )

    if not filename and jupyter_display:
        return iframe_with_srcdoc(html_str, iframe_width, iframe_height)

    elif not filename and as_string:
        return html_str

    elif not filename:
        raise TypeError("To save to a file, provide a file path. To get an HTML string, set as_string=True. To render a visual in Jupyter, set jupyter_display=True")

    if jupyter_display and in_google_collab:
        render_for_collab(html_str, iframe_height)

    try:
        f = open(filename, "w+")
        f.write(html)
    finally:
        if f is None:
            raise Exception("pydeck could not write a file")
        f.close()
    if open_browser:
        display_html(realpath(f.name))
