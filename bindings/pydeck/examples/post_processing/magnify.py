"""Magnify
-------

Magnify a circular region in the center of the scene.
"""

from _utils import write_post_processing_example

write_post_processing_example(
    "magnify",
    "magnify.html",
    radius_pixels=170,
    zoom=2.5,
    border_width_pixels=5,
    border_color=[255, 255, 255, 255],
    **{"screenXY": [0.5, 0.5]},
)
