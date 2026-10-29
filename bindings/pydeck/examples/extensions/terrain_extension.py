"""
TerrainExtension
================

A route draped over 3D terrain using the deck.gl ``TerrainExtension``. A ``TerrainLayer``
builds the surface from free Mapterhorn tiles (Terrarium-encoded elevation, no access token
required). OpenFreeMap vector tiles and the route are draped onto this surface.
The ``MVTLayer`` and ``PathLayer`` use the extension
with ``terrain_draw_mode="drape"`` so it follows the elevation of the surface below it.
"""

import pydeck as pdk

# Free, token-free elevation tiles (Mapterhorn, Terrarium encoding)
ELEVATION_DATA = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"
VECTOR_TILES = "https://tiles.openfreemap.org/planet"
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

terrain = pdk.Layer(
    "TerrainLayer",
    elevation_data=ELEVATION_DATA,
    elevation_decoder=ELEVATION_DECODER,
    max_zoom=12,
    tile_size=512,
    # Draw the terrain surface so it displays the draped vector features.
    operation="'terrain+draw'",
)

# Vector basemap features follow the terrain without a raster texture.
basemap = pdk.Layer(
    "MVTLayer",
    data=VECTOR_TILES,
    min_zoom=0,
    max_zoom=14,
    get_fill_color="properties.layerName == 'water' ? [120, 150, 180] : [218, 218, 218]",
    get_line_color=[128, 128, 128],
    get_line_width=1,
    line_width_min_pixels=1,
    terrain_draw_mode="'drape'",
    extensions=[pdk.Extension("TerrainExtension")],
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
r = pdk.Deck(
    layers=[terrain, basemap, route],
    initial_view_state=view_state,
    description=(
        '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a> | '
        '<a href="https://openfreemap.org/">OpenFreeMap</a> | '
        '<a href="https://openmaptiles.org/">© OpenMapTiles</a> | '
        'Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    ),
    # The draped MVT layer is the basemap; don't add a second flat basemap underneath.
    map_provider=None,
)
r.to_html("terrain_extension.html")
