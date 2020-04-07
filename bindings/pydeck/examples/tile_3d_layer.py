"""
Tile3DLayer
===========

Visualization of Mount St. Helen's served as a 3D tileset from Cesium

You can get access to a Cesium token here:

https://cesium.com/docs/tutorials/getting-started/#your-first-app
"""

import pydeck

initial_view_state = pydeck.ViewState(**{
    "latitude": 46.23,
    "longitude": -122.17,
    "pitch": 60,
    "maxPitch": 60,
    "bearing": 0,
    "minZoom": 2,
    "maxZoom": 30,
    "zoom": 12.5
})

layer = pydeck.Layer(
    "Tile3DLayer",
    data="https://assets.cesium.com/33301/tileset.json",
    id="tiles-st-helens",
    loader="@@#CesiumIonLoader",
    loadOptions={
        "cesium-ion": {
            "accessToken": os.environ('CESIUM_API_KEY'),  # noqa
        }
    },
)


r = pydeck.Deck(
    layers=[layer],
    initial_view_state=initial_view_state,
)
r.to_html("tile_3d_layer.html", notebook_display=False, offline=True)
