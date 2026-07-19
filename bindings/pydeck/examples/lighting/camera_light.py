"""CameraLight
=============

Attach a point light to the current camera position.
"""

import pydeck as pdk

from _utils import write_lighting_example

write_lighting_example(
    pdk.Effect("CameraLight", color=[210, 230, 255], intensity=2.5),
    "camera_light.html",
)
