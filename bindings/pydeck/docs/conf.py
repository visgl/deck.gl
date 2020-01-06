# -*- coding: utf-8 -*-
# Point Sphinx autodoc at our source
import sys
import os

sys.path.insert(0, os.path.abspath('../'))

project = u'pydeck'
copyright = u'2020, Uber Technologies, Inc.'
author = u'Andrew Duberstein'
# The short X.Y version
version = u''
# The full version, including alpha/beta/rc tags
release = u'0.1.dev5'
# Extensions to generate documents from our docstrings here
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon'
]
templates_path = ['_templates']
source_suffix = '.rst'
master_doc = 'index'
language = None
exclude_patterns = [u'_build']
pygments_style = None
html_theme = 'alabaster'
html_static_path = ['_static']
htmlhelp_basename = 'pydeckdoc'
man_pages = [
    (master_doc, 'pydeck', u'pydeck Documentation',
     [author], 1)
]
texinfo_documents = [
    (master_doc, 'pydeck', u'pydeck Documentation',
     author, 'pydeck', 'Python wrapper for deck.gl',
     'Miscellaneous'),
]
epub_title = project
epub_exclude_files = ['search.html']
autoclass_content = "both"
