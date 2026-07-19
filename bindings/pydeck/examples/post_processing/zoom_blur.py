"""Zoom Blur
=========

Apply radial motion blur around the image center.
"""

from _utils import write_post_processing_example

write_post_processing_example("zoomBlur", "zoom_blur.html", center=[0.5, 0.5], strength=0.45)
