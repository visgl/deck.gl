"""
TerrainExtension
================

A route draped over 3D terrain using the deck.gl ``TerrainExtension``. A ``TerrainLayer``
builds the surface from the free AWS Terrain Tiles (terrarium-encoded elevation, no access
token required) with NASA Blue Marble imagery as the texture. The ``PathLayer`` uses the extension
with ``terrain_draw_mode="drape"`` so it follows the elevation of the surface below it.
"""

import pydeck as pdk

# Free, token-free elevation tiles (AWS Terrain Tiles, terrarium encoding)
ELEVATION_DATA = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
TEXTURE = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

terrain = pdk.Layer(
    "TerrainLayer",
    elevation_data=ELEVATION_DATA,
    texture=TEXTURE,
    # Blue Marble supports zoom levels 0–8; reuse the highest-resolution tiles when zooming in.
    max_zoom=8,
    elevation_decoder=ELEVATION_DECODER,
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
r = pdk.Deck(
    layers=[terrain, route],
    initial_view_state=view_state,
    map_provider="maplibre",
    map_style="https://tiles.openfreemap.org/styles/dark",
)
r.to_html("terrain_extension.html")
