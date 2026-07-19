"""PointLight
============

Illuminate geometry from a fixed geographic position.
"""

import pydeck as pdk

from _utils import write_lighting_example

write_lighting_example(
    pdk.Effect("PointLight", color=[255, 150, 90], intensity=3.0, position=[-1.5, -1, 180000]),
    "point_light.html",
)
