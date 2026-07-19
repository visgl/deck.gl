"""Vignette
========

Darken the image toward its outer edge.
"""

from _utils import write_post_processing_example

write_post_processing_example("vignette", "vignette.html", radius=0.45, amount=0.8)
