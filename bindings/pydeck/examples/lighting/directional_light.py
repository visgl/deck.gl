"""DirectionalLight
==================

Cast parallel light and shadows from a fixed direction.
"""

import pydeck as pdk

from _utils import write_lighting_example

write_lighting_example(
    pdk.Effect("DirectionalLight", color=[255, 235, 190], intensity=2.2, direction=[-2, -4, -3], _shadow=True),
    "directional_light.html",
)
