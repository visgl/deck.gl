import jinja2
import os
import os.path
import tempfile


TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), './templates/')
j2_env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATES_PATH),
                            trim_blocks=True)

def render_json_to_html(json_input, mapbox_api_key=None):
    js = j2_env.get_template('index.j2')
    html = js.render(
        mapbox_api_key=mapbox_api_key,
        json_input=json_input)
    return html


def display_html(html_str, filename=None):
    """Converts HTML into a temporary file and open it in the system browser or IPython/Jupyter Notebook IFrame.

    Parameters
    ==========
    html_str : str:
        String of HTML to render filename
    filename : str, default None"""
    pass


def open_named_or_temporary_file(filename='', dir=''):
    if filename:
        filename = add_html_extension(filename)
        return open(filename, 'w+')
    if dir:
        return tempfile.NamedTemporaryFile(
            suffix='.html', dir=dir, delete=False)
    return tempfile.NamedTemporaryFile(
        suffix='.html', delete=False)


def add_html_extension(fname):
    if fname.endswith('.html') or fname.endswith('.htm'):
        return fname
    if fname is None:
        raise Exception("File has no name")
    return fname + '.html'
