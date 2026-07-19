"""Tilt Shift
==========

Create a shallow depth-of-field band across the scene.
"""

from _utils import write_post_processing_example

write_post_processing_example(
    "tiltShift",
    "tilt_shift.html",
    start=[0, 300],
    end=[800, 300],
    blur_radius=28,
    gradient_radius=180,
)
