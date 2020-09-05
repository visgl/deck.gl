"""Script to embed pydeck examples into .rst pages with code

These populate the files you see once you click into a grid cell
on the pydeck gallery page
"""
from multiprocessing import Pool
import os
import subprocess
import sys

from const import (
    DECKGL_URL_BASE,
    EXAMPLE_GLOB,
    GALLERY_DIR,
    HTML_DIR,
    HOSTED_STATIC_PATH,
)

from utils import to_presentation_name, to_snake_case_string
from templates import DOC_TEMPLATE


if not os.environ.get("MAPBOX_API_KEY"):
    # If running for rtfd.io, set this variable from the Admin panel
    raise Exception("MAPBOX_API_KEY not set")


def create_rst(pydeck_example_file_name):
    asset_name = to_snake_case_string(file_name=pydeck_example_file_name)
    deckgl_docs_layer_name = asset_name.replace("_", "-")
    deckgl_doc_url = None
    if "layer" in deckgl_docs_layer_name:
        # Don't add a deck.gl docs link if we're not referencing a layer
        # Obviously very rough, should change this eventually to handle views etc
        deckgl_doc_url = DECKGL_URL_BASE + deckgl_docs_layer_name
    # Create new .html examples
    html_fname = os.path.basename(pydeck_example_file_name).replace(".py", ".html")
    # Run the pydeck example and move the .html output
    subprocess.call(
        "{python} {fname}; mv {html_src} {html_dest}".format(
            python=sys.executable,
            fname=pydeck_example_file_name,
            html_src=html_fname,
            html_dest=HTML_DIR,
        ),
        shell=True,
    )
    python_code = open(pydeck_example_file_name, "r").read()
    doc_source = DOC_TEMPLATE.render(
        page_title=to_presentation_name(asset_name),
        snake_name=asset_name,
        python_code=python_code,
        hosted_html_path=os.path.join(HOSTED_STATIC_PATH, html_fname),
        deckgl_doc_url=deckgl_doc_url,
    )
    rst_path = os.path.join(GALLERY_DIR, asset_name + ".rst")
    f = open(rst_path, "w+")
    print("* Converted %s to %s" % (pydeck_example_file_name, rst_path))
    f.write(doc_source)
    f.close()


def main():
    pool = Pool(processes=4)
    candidate_files = [f for f in EXAMPLE_GLOB]
    if not candidate_files:
        raise Exception("No files found to convert")
    subprocess.call("mkdir -p %s" % HTML_DIR, shell=True)
    pool.map(create_rst, candidate_files)


if __name__ == "__main__":
    main()
