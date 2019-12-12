import os
from os.path import relpath, realpath
import tempfile
import time
import webbrowser

import jinja2
from IPython.display import IFrame


TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), './templates/')
j2_env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATES_PATH),
                            trim_blocks=True)


def render_json_to_html(json_input, mapbox_key=None, tooltip=True):
    js = j2_env.get_template('index.j2')
    if type(tooltip) == bool:
        tooltip = 'true' if tooltip else 'false'
    html_str = js.render(
        mapbox_key=mapbox_key,
        json_input=json_input,
        deckgl_jupyter_widget_bundle='https://cdn.jsdelivr.net/npm/@deck.gl/jupyter-widget@8.0.0-alpha.2/dist/index.js',
        tooltip=tooltip
    )
    return html_str


def display_html(filename=None, height=500, width=500):
    """Converts HTML into a temporary file and opens it in the system browser."""
    url = 'file://{}'.format(filename)
    # Hack to prevent blank page
    time.sleep(0.5)
    webbrowser.open(url)


def check_directory_exists(path):
    return os.path.isdir(path) and os.path.exists(path)


def open_named_or_temporary_file(pathname=None):
    if pathname and not pathname.endswith('/'):
        filename = add_html_extension(pathname)
        return open(filename, 'w+')
    directory = make_directory_if_not_exists(pathname) or os.path.curdir
    return tempfile.NamedTemporaryFile(
        prefix='pydeck', mode='w+', suffix='.html', dir=directory, delete=False)


def make_directory_if_not_exists(path):
    if path and not os.path.exists(path):
        os.makedirs(path)
    return path


def add_html_extension(fname):
    SUFFIX = '.html'
    if fname.endswith(SUFFIX):
        return str(fname)
    return str(fname + '.html')


def deck_to_html(
        deck_json,
        mapbox_key=None,
        filename=None,
        open_browser=False,
        notebook_display=False,
        iframe_height=500,
        iframe_width=500,
        tooltip=True):
    """Converts deck.gl format JSON to an HTML page"""
    html = render_json_to_html(deck_json, mapbox_key=mapbox_key, tooltip=tooltip)
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
        notebook_to_html_path = relpath(f.name)
        display(IFrame(os.path.join('./', notebook_to_html_path), width=iframe_width, height=iframe_height))  # noqa
    return realpath(f.name)
