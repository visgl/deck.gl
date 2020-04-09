# -*- coding: utf-8 -*-
# Point Sphinx autodoc at our source
import os
import subprocess
import sys

sys.path.insert(0, os.path.abspath("../"))

project = "pydeck"
copyright = "2020, MIT License"
author = "Andrew Duberstein"
# The short X.Y version
version = "0.3"
# The full version, including alpha/beta/rc tags
release = "0.3.0"
# Extensions to generate documents from our docstrings here
extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon", "sphinx_rtd_theme"]
templates_path = ["_templates"]
source_suffix = ".rst"
master_doc = "index"
language = None
exclude_patterns = ["_build"]
pygments_style = None
html_theme = "sphinx_rtd_theme"
html_static_path = ["gallery/html"]
htmlhelp_basename = "pydeckdoc"
man_pages = [(master_doc, "pydeck", "pydeck Documentation", [author], 1)]
texinfo_documents = [
    (master_doc, "pydeck", "pydeck Documentation", author, "pydeck", "Python wrapper for deck.gl", "Miscellaneous",),
]
epub_title = project
epub_exclude_files = ["search.html"]
autoclass_content = "both"
html_theme_options = {"includehidden": False}
add_module_names = False


def setup(app):
    if os.environ.get("READTHEDOCS"):
        print("RTD running in the following directory:", os.getcwd())
        subprocess.call(
            "{python} bindings/pydeck/docs/scripts/embed_examples.py".format(python=sys.executable), shell=True,
        )
    else:
        from docs.scripts import embed_examples  # noqa

        embed_examples.main()
