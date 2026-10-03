"""
TerrainExtension
================

A route draped over 3D terrain using the deck.gl ``TerrainExtension``. A ``TerrainLayer``
builds the surface from free Mapterhorn tiles (Terrarium-encoded elevation, no access token
required) with VersaTiles satellite imagery as the texture. The ``PathLayer`` uses the extension
with ``terrain_draw_mode="drape"`` so it follows the elevation of the surface below it.
"""

import pydeck as pdk

# Free, token-free elevation tiles (Mapterhorn, Terrarium encoding)
ELEVATION_DATA = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"
TEXTURE = "https://tiles.versatiles.org/tiles/satellite/{z}/{x}/{y}.webp"
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

terrain = pdk.Layer(
    "TerrainLayer",
    elevation_data=ELEVATION_DATA,
    texture=TEXTURE,
    elevation_decoder=ELEVATION_DECODER,
    max_zoom=12,
    tile_size=512,
    operation="'terrain+draw'",
)

# A route across the Marin hills, draped onto the terrain surface
route = pdk.Layer(
    "PathLayer",
    [{"path": [[-122.475, 37.905], [-122.463, 37.892], [-122.452, 37.878], [-122.437, 37.868], [-122.423, 37.859]]}],
    get_path="path",
    get_color=[255, 64, 64],
    get_width=8,
    width_units="'pixels'",
    cap_rounded=True,
    joint_rounded=True,
    # Props added to the layer by the TerrainExtension. Quote the literal draw-mode enum
    # so pydeck serializes it verbatim instead of as an ``@@=`` accessor.
    terrain_draw_mode="'drape'",
    extensions=[pdk.Extension("TerrainExtension")],
)

view_state = pdk.ViewState(latitude=37.878, longitude=-122.448, zoom=12, pitch=55, bearing=15)
r = pdk.Deck(layers=[terrain, route], initial_view_state=view_state)
r.to_html("terrain_extension.html")
