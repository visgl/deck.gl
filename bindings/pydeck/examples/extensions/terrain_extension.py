"""
TerrainExtension
================

A route draped over 3D terrain using the deck.gl ``TerrainExtension``. A ``TerrainLayer``
builds the surface from the free AWS Terrain Tiles (terrarium-encoded elevation, no access
token required) with a CARTO basemap as the texture. The ``PathLayer`` uses the extension
with ``terrain_draw_mode="offset"`` so it follows the elevation of the surface below it.
"""

import pydeck as pdk

# Free, token-free elevation tiles (AWS Terrain Tiles, terrarium encoding)
ELEVATION_DATA = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
TEXTURE = "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

terrain = pdk.Layer(
    "TerrainLayer",
    elevation_data=ELEVATION_DATA,
    texture=TEXTURE,
    elevation_decoder=ELEVATION_DECODER,
)

# A route across the Marin hills, draped onto the terrain surface
route = pdk.Layer(
    "PathLayer",
    [{"path": [[-122.475, 37.905], [-122.463, 37.892], [-122.452, 37.878], [-122.437, 37.868], [-122.423, 37.859]]}],
    get_path="path",
    get_color=[255, 64, 64],
    get_width=10,
    width_min_pixels=6,
    cap_rounded=True,
    joint_rounded=True,
    # Props added to the layer by the TerrainExtension:
    terrain_draw_mode="offset",
    extensions=[pdk.Extension("TerrainExtension")],
)

view_state = pdk.ViewState(latitude=37.878, longitude=-122.448, zoom=12, pitch=55, bearing=15)
r = pdk.Deck(layers=[terrain, route], initial_view_state=view_state)
r.to_html("terrain_extension.html")
