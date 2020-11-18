"""Generates an rst file that tells sphinx includes the image assets when building the docs"""
import os

from templates import LOCAL_DOCS_PATH, IMAGES_RST_TEMPLATE
from const import EXAMPLE_NAMES


def main():
    rendered = IMAGES_RST_TEMPLATE.render(assets=EXAMPLE_NAMES)
    with open(os.path.join(LOCAL_DOCS_PATH, "images.rst"), "w+") as f:
        f.write(rendered)


if __name__ == "__main__":
    main()
