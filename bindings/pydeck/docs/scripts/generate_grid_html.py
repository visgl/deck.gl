"""Generates HTML grid landing page for gallery examples"""
import os
import glob

from const import EXAMPLE_GLOB, HTML_DIR
from templates import HTML_TEMPLATE
from utils import to_presentation_name, to_snake_case_string


here = os.path.dirname(os.path.abspath(__file__))
gallery_examples = sorted([to_snake_case_string(file_name=gallery_example) for gallery_example in EXAMPLE_GLOB])


def create_grid():
    doc_source = HTML_TEMPLATE.render(gallery_examples=gallery_examples, to_presentation_name=to_presentation_name)
    with open(os.path.join(HTML_DIR, "grid.html"), "w+") as f:
        f.write(doc_source)


if __name__ == "__main__":
    create_grid()
