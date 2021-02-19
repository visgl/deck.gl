"""
BitmapLayer
===========

A 1906 Britton & Rey's map of San Francisco's 1906 fire, overlaid on
an interactive map of San Francisco.
"""

import pydeck as pdk


# Map of San Francisco from 1906
IMG_URL = "https://i.imgur.com/W95ked7.jpg"

# Specifies the corners of the image bounding box
BOUNDS = [
    [-122.52690000000051, 37.70313158980733],
    [-122.52690000000051, 37.816395657523195],
    [-122.34604834372873, 37.816134829424335],
    [-122.34656848822227, 37.70339041384273],
]

bitmap_layer = pdk.Layer("BitmapLayer", image=IMG_URL, bounds=BOUNDS, opacity=0.7)

view_state = pdk.ViewState(
    latitude=37.7576171,
    longitude=-122.5776844,
    zoom=10,
    bearing=-45,
    pitch=60,
)

r = pdk.Deck(bitmap_layer, initial_view_state=view_state, map_provider="mapbox", map_style=pdk.map_styles.SATELLITE)

r.to_html("bitmap_layer.html")
