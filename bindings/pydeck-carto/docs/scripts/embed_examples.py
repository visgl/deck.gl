"""Script to embed pydeck examples into .rst pages with code

These populate the files you see once you click into a grid cell
on the pydeck gallery page
"""
from multiprocessing import Pool
import os
import subprocess

from const import DECKGL_URL_BASE, GALLERY_DIR, HTML_DIR, HOSTED_STATIC_PATH, ALL_EXAMPLE_GLOB

from utils import to_presentation_name, to_snake_case_string
from templates import DOC_TEMPLATE


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
        "mv {html_src} {html_dest}".format(html_src=html_fname, html_dest=HTML_DIR),shell=True,)
    python_code = open(pydeck_example_file_name, "r").read()
    presentation_name = to_presentation_name(asset_name)
    title_underline = '^' * len(presentation_name)
    doc_source = DOC_TEMPLATE.render(
        page_title=presentation_name,
        title_underline=title_underline,
        snake_name=asset_name,
        asset_name=asset_name,
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
    candidate_files = [f for f in ALL_EXAMPLE_GLOB]
    if not candidate_files:
        raise Exception("No files found to convert")
    subprocess.call("mkdir -p %s" % HTML_DIR, shell=True)
    pool.map(create_rst, candidate_files)


if __name__ == "__main__":
    main()
