"""SunLight
==========

Position a shadow-casting directional light from a timestamp.
"""

import pydeck as pdk

from _utils import write_lighting_example

write_lighting_example(
    pdk.Effect("SunLight", timestamp=1561982400000, color=[255, 244, 214], intensity=2.0, _shadow=True),
    "sun_light.html",
)
