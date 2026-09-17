"""
TerrainLayer
===========

Extruded terrain using Mapterhorn elevation tiles and VersaTiles satellite imagery
"""

import pydeck as pdk

# Mapterhorn terrain tiles use the Terrarium encoding
TERRAIN_IMAGE = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"

# Define how to parse elevation tiles
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

SURFACE_IMAGE = "https://tiles.versatiles.org/tiles/satellite/{z}/{x}/{y}.webp"

terrain_layer = pdk.Layer(
    "TerrainLayer",
    elevation_decoder=ELEVATION_DECODER,
    texture=SURFACE_IMAGE,
    elevation_data=TERRAIN_IMAGE,
    max_zoom=12,
    tile_size=512,
)

view_state = pdk.ViewState(latitude=46.24, longitude=-122.18, zoom=11.5, bearing=140, pitch=60)

r = pdk.Deck(terrain_layer, initial_view_state=view_state)

r.to_html("terrain_layer.html")
