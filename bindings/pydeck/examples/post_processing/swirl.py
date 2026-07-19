"""Swirl
=====

Rotate pixels around the image center with radial falloff.
"""

from _utils import write_post_processing_example

write_post_processing_example("swirl", "swirl.html", center=[0.5, 0.5], radius=260, angle=4.5)
