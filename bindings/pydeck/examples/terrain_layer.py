"""
TerrainLayer
===========

Extruded terrain using Mapterhorn terrain tiles and Mapbox Satellite imagery
"""

import pydeck as pdk
import os

# Import Mapbox API Key from environment (deck.gl uses MapboxAccessToken, pydeck uses MAPBOX_API_KEY)
MAPBOX_API_KEY = os.environ.get("MapboxAccessToken") or os.environ.get("MAPBOX_API_KEY", "")

# Mapterhorn terrain tiles
TERRAIN_IMAGE = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"

# Define how to parse elevation tiles
ELEVATION_DECODER = {"rScaler": 256, "gScaler": 1, "bScaler": 1 / 256, "offset": -32768}

SURFACE_IMAGE = f"https://api.mapbox.com/v4/mapbox.satellite/{{z}}/{{x}}/{{y}}@2x.png?access_token={MAPBOX_API_KEY}"

terrain_layer = pdk.Layer(
    "TerrainLayer",
    elevation_decoder=ELEVATION_DECODER,
    tile_size=512,
    texture=SURFACE_IMAGE,
    elevation_data=TERRAIN_IMAGE
)

view_state = pdk.ViewState(latitude=46.24, longitude=-122.18, zoom=11.5, bearing=140, pitch=60)

r = pdk.Deck(
    terrain_layer,
    initial_view_state=view_state,
    description='Terrain: <a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
)

r.to_html("terrain_layer.html")
