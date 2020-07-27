"""
ScreenGridLayer
===============

Locations of bike parking within San Francisco. Aggregation level varies depending on the viewport of the user.

Adapted from the deck.gl documentation.
"""

import pydeck as pdk
import pandas as pd

SCREEN_GRID_LAYER_DATA = (
    "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json"  # noqa
)
df = pd.read_json(SCREEN_GRID_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    "ScreenGridLayer",
    df,
    pickable=False,
    opacity=0.8,
    cell_size_pixels=50,
    color_range=[
        [0, 25, 0, 25],
        [0, 85, 0, 85],
        [0, 127, 0, 127],
        [0, 170, 0, 170],
        [0, 190, 0, 190],
        [0, 255, 0, 255],
    ],
    get_position="COORDINATES",
    get_weight="SPACES",
)

# Set the viewport location
view_state = pdk.ViewState(latitude=37.7749295, longitude=-122.4194155, zoom=11, bearing=0, pitch=0)

# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state)
r.to_html("screengrid_layer.html")
