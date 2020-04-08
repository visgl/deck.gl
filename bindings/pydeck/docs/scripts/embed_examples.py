"""Script to convert pydeck examples into .rst pages with code"""
import os
import glob
import jinja2

from multiprocessing import Pool

import subprocess

from utils import to_presentation_name, to_snake_case_layer_name


DOC_TEMPLATE = jinja2.Template(
    """
{{ layer_name }}
================================

.. raw:: html

    <a id="deck-link" target="_blank" href="{{deckgl_doc_url}}">deck.gl docs</a>
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


EXAMPLE_GLOB = "../examples/*_layer.py"
GALLERY_DIR = "./gallery/"
HTML_DIR = "./gallery/html/"
STATIC_PATH = "../_static/"
DECKGL_URL_BASE = "https://deck.gl/#/documentation/deckgl-api-reference/layers/"


def create_rst(fname):
    layer_name = to_snake_case_layer_name(fname)
    deckgl_docs_layer_name = layer_name.replace("_", "-")
    deckgl_doc_url = DECKGL_URL_BASE + deckgl_docs_layer_name
    # Create new .html examples
    html_fname = os.path.basename(fname).replace(".py", ".html")
    subprocess.call(
        "source activate ../env; python {fname}; mv {html_src} {html_dest}".format(
            fname=fname, html_src=html_fname, html_dest=HTML_DIR,
        ),
        shell=True,
    )
    python_code = open(fname, "r").read()
    doc_source = DOC_TEMPLATE.render(
        layer_name=to_presentation_name(layer_name),
        snake_name=layer_name,
        python_code=python_code,
        hosted_html_path=os.path.join(STATIC_PATH, html_fname),
        deckgl_doc_url=deckgl_doc_url,
    )
    rst_path = os.path.join(GALLERY_DIR, layer_name + ".rst")
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
