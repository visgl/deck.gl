"""Generates HTML grid landing page for gallery examples, grouped into sections"""

import os

from const import HTML_DIR, grouped_examples
from templates import HTML_TEMPLATE
from utils import to_presentation_name


def create_grid():
    doc_source = HTML_TEMPLATE.render(grouped_examples=grouped_examples(), to_presentation_name=to_presentation_name)
    with open(os.path.join(HTML_DIR, "grid.html"), "w+") as f:
        f.write(doc_source)


if __name__ == "__main__":
    create_grid()
