"""Bulge Pinch
===========

Bulge the center of the scene with radial image warping.
"""

from _utils import write_post_processing_example

write_post_processing_example("bulgePinch", "bulge_pinch.html", center=[0.5, 0.5], radius=250, strength=0.75)
