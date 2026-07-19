"""Denoise
-------

Smooth color variation with a bilateral filter.
"""

from _utils import write_post_processing_example

write_post_processing_example("denoise", "denoise.html", strength=0.8)
