"""
A5Layer
=======

Plot of bike parking density in San Francisco using the A5 geospatial indexing system.

A5 is a pentagonal discrete global grid system that provides equal-area cells worldwide.
Learn more at https://a5geo.org

This example is adapted from the deck.gl documentation.
"""

import pydeck as pdk
import pandas as pd

A5_DATA = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json"

df = pd.read_json(A5_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    "A5Layer",
    df,
    pickable=True,
    extruded=True,
    get_pentagon="pentagon",
    get_fill_color="[(1 - count / 211) * 235, 255 - 85 * count / 211, 255 - 170 * count / 211]",
    get_elevation="count",
    elevation_scale=10,
)

# Set the viewport location - centered on San Francisco
view_state = pdk.ViewState(
    latitude=37.74,
    longitude=-122.4,
    zoom=11,
    bearing=0,
    pitch=40
)

# Render
r = pdk.Deck(
    layers=[layer],
    initial_view_state=view_state,
    tooltip={"text": "{pentagon} count: {count}"}
)
r.to_html("a5_layer.html")
