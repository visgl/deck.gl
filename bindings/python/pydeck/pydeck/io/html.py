import time
import jinja2
import os
import os.path
import tempfile

import webbrowser
from IPython.display import IFrame


TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), './templates/')
j2_env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATES_PATH),
                            trim_blocks=True)

def render_json_to_html(json_input, mapbox_api_key=None):
    js = j2_env.get_template('index.j2')
    html = js.render(
        mapbox_api_key=mapbox_api_key,
        json_input=json_input)
    return html


def display_html(filename=None):
    """Converts HTML into a temporary file and open it in the system browser or IPython/Jupyter Notebook IFrame."""
    try:
        return IFrame(filename, height=500, width=500)
    except Exception:
        try:
            url = 'file://{}'.format(filename)
            # Hack to prevent blank page
            time.sleep(0.5)
            webbrowser.open(url)
        except Exception:
            raise


def open_named_or_temporary_file(filename=''):
    if filename:
        filename = add_html_extension(filename)
        return open(filename, 'w+')
    return tempfile.NamedTemporaryFile(
        suffix='.html', dir=os.cwd(), delete=False)


def add_html_extension(fname):
    if fname.endswith('.html') or fname.endswith('.htm'):
        return fname
    if fname is None:
        raise Exception("File has no name")
    return fname + '.html'


def to_html(deck_json, mapbox_key, filename=None):
    html = render_json_to_html(deck_json, mapbox_key)
    f = open_named_or_temporary_file(filename)
    f.write(html)
    f.close()
    display_html(f.name)
