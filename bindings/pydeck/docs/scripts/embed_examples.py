"""Script to convert pydeck examples into .rst pages with code"""
import glob
import jinja2
from multiprocessing import Pool
import os
import subprocess
import sys

from utils import to_presentation_name, to_snake_case_layer_name


if not os.environ.get("MAPBOX_API_KEY"):
    # If running for rtfd.io, set this variable from the Admin panel
    raise Exception("MAPBOX_API_KEY not set")


DOC_TEMPLATE = jinja2.Template(
    """
{{ page_title }}
^^^^^^^^^^^^^^^^

.. raw:: html

    {% if deckgl_doc_url %}
    <a id="deck-link" target="_blank" href="{{deckgl_doc_url}}">deck.gl docs</a>
    {% endif %}
    <br />

.. raw:: html
   :file: ./html/{{ snake_name }}.html

.. raw:: html

    <style>
    #deck-container {
        height: 50vh;
        max-width: 650px;
        width: 100%;
    }
    #deck-link {
        float: right;
        position: relative;
        top: -20px;
    }
    </style>

Source
------

.. code-block:: python

{{ python_code|indent(4, True) }}

"""
)


EXAMPLE_GLOB = "../examples/*.py"
GALLERY_DIR = "./gallery/"
HTML_DIR = "./gallery/html/"
STATIC_PATH = "../_static/"
DECKGL_URL_BASE = "https://deck.gl/docs/api-reference/layers/"


def create_rst(fname):
    asset_name = to_snake_case_layer_name(fname)
    deckgl_docs_layer_name = asset_name.replace("_", "-")
    deckgl_doc_url = None
    if 'layer' not in deckgl_docs_layer_name:
        deckgl_doc_url = DECKGL_URL_BASE + deckgl_docs_layer_name
    # Create new .html examples
    html_fname = os.path.basename(fname).replace(".py", ".html")
    subprocess.call(
        "{python} {fname}; mv {html_src} {html_dest}".format(
            python=sys.executable, fname=fname, html_src=html_fname, html_dest=HTML_DIR,
        ),
        shell=True,
    )
    python_code = open(fname, "r").read()
    doc_source = DOC_TEMPLATE.render(
        page_title=to_presentation_name(asset_name),
        snake_name=asset_name,
        python_code=python_code,
        hosted_html_path=os.path.join(STATIC_PATH, html_fname),
        deckgl_doc_url=deckgl_doc_url,
    )
    rst_path = os.path.join(GALLERY_DIR, asset_name + ".rst")
    f = open(rst_path, "w+")
    print("* Converted %s to %s" % (fname, rst_path))
    f.write(doc_source)
    f.close()


def main():
    pool = Pool(processes=4)
    candidate_files = [f for f in glob.glob(EXAMPLE_GLOB)]
    if not candidate_files:
        raise Exception("No files found to convert")
    subprocess.call("mkdir -p %s" % HTML_DIR, shell=True)
    pool.map(create_rst, candidate_files)


if __name__ == "__main__":
    main()
