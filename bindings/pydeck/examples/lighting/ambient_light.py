"""AmbientLight
===============

Illuminate every surface evenly with ambient light.
"""

import pydeck as pdk

from _utils import write_lighting_example

write_lighting_example(
    pdk.Effect("AmbientLight", color=[170, 210, 255], intensity=1.2),
    "ambient_light.html",
)
