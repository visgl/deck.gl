Documentation example scripts
=============================

Helper scripts for generating pydeck documentation.

* `embed_examples.py` creates a series of .rst files with both embedded source code
   and an embedded example in them.
* `generate_grid_html.py` creates an HTML grid of links to those rst pages within thumbnails.
   It is the landing page for pydeck's website.
* `snap_thumbnails.py` creates the .png files used as those thumbnails from examples.


Adding an example to the gallery
================================

1) Add a script under `examples/`, or under `examples/<group>/` to place it in its own gallery section
   (the folder name becomes the section title, e.g. `examples/charts/` -> "Charts"). The script must write
   `<basename>.html` to the working directory. Avoid `layer` or `view` in the file name unless it names a
   deck.gl class: `to_presentation_name` turns `scatter_plot` into "Scatter Plot" but `multi_view` into
   "MultiView".
2) Install the screenshot dependencies: `uv pip install playwright Pillow && playwright install chromium`.
3) Create the thumbnail: `python scripts/snap_thumbnails.py ../examples/<group>/<name>.py`
   (or `make html-thumbnails` for every example). It writes `gallery/images/<name>.png`.
4) Regenerate the registry and grid: `python scripts/update_images_rst.py` then
   `python scripts/generate_grid_html.py`. Commit the PNG, `images.rst` and `gallery/html/grid.html`.
