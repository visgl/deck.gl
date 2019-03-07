from . import snippets
from IPython.core.display import (
    display,
    HTML,
    Javascript
)


def render_json(json, height=400, width=600):
    # TODO cehck if the HTML is already cached in current cell and don't reload if it is
    # Might be helpful:
    # http://jakevdp.github.io/blog/2013/06/01/ipython-notebook-javascript-python-communication/
    html = HTML(snippets.JUPYTER_HTML.render(height=height, width=width))
    js_str = snippets.JUPYTER_JS.render(json=json, height=height, width=width)
    rendered_js = Javascript(js_str)
    display(html)
    display(rendered_js)
