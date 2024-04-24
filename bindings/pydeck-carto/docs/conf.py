# -*- coding: utf-8 -*-
# Point Sphinx autodoc at our source
import datetime
import os
import subprocess
import sys

sys.path.insert(0, os.path.abspath("../"))

project = "pydeck-carto"

copyright = f"{datetime.datetime.utcnow().year}, CartoDB Inc"
author = "CARTO"
# The short X.Y version
version = "0.1"
# The full version, including alpha/beta/rc tags
release = "0.1.1b0"
# Extensions to generate documents from our docstrings here
extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon", "sphinx_rtd_theme"]
templates_path = ["_templates"]
source_suffix = ".rst"
master_doc = "index"
language = 'en'
exclude_patterns = ["_build"]
pygments_style = None
html_theme = "sphinx_rtd_theme"
htmlhelp_basename = "pydeckdoc"
man_pages = [(master_doc, "pydeck", "pydeck Documentation", [author], 1)]
texinfo_documents = [
    (master_doc, "pydeck", "pydeck Documentation", author, "pydeck", "Python wrapper for deck.gl with Carto support", "Miscellaneous")
]
epub_title = project
epub_exclude_files = ["search.html"]
autoclass_content = "both"
html_theme_options = {"includehidden": False}
add_module_names = False
html_favicon = "favicon.ico"
