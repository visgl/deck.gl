import os
from pathlib import Path
import tempfile
import time
import webbrowser

import jinja2
from IPython.display import IFrame


TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), './templates/')
j2_env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATES_PATH),
                            trim_blocks=True)

def render_json_to_html(json_input, mapbox_api_key=None):
    js = j2_env.get_template('index.j2')
    html_str = js.render(
        mapbox_api_key=mapbox_api_key,
        json_input=json_input,
        release_version='7.1.0',
        mapbox_gl_version='0.53.1')
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
    return str(Path(fname).with_suffix('.html'))


def deck_to_html(
        deck_json,
        mapbox_key=None,
        filename=None,
        open_browser=False,
        notebook_display=False,
        iframe_height=500,
        iframe_width=500):
    """Converts deck.gl format JSON to an HTML page"""
    html = render_json_to_html(deck_json, mapbox_key)
    f = None
    try:
        f = open_named_or_temporary_file(filename)
        f.write(html)
    finally:
        if f is None:
            raise Exception("deckgl did not write a file")
        f.close()
    if open_browser is True:
        display_html(f.name)
    if is_jupyter_notebook is True and notebook_display is True:
        display(IFrame('file://' + f.name, width=iframe_width, height=iframe_width))  # noqa
    return f.name


def is_jupyter_notebook():
    """Returns True if environment is a Jupyter notebook"""
    try:
        ip = get_ipython()  # noqa
        if ip.has_trait('kernel'):
            return True
    finally:
        return False
