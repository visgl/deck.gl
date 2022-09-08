Documentation example scripts
=============================

Helper scripts for generating pydeck documentation.

* `embed_examples.py` creates a series of .rst files with both embedded source code
   and an embedded example in them.
* `generate_grid_html.py` creates an HTML grid of links to those rst pages within thumbnails.
   It is the landing page for pydeck-carto's website.


Adding a new layer to the gallery
=================================

To add a new layer to the gallery:

0) Run `pip install pyppeteer && pip install Image`
1) Add the layer into the `docs/images.rst`
2) Run `make html-grid-page`
3) Create a thumbnail, e.g., `python scripts/snap_thumbnails.py ../examples/arc_layer.py`.
   If you have to create a thumbnail for multiple example files, run `make html-thumbnails`
