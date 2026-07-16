"""
DataFilterExtension
===================

Plot of BART (Bay Area Rapid Transit) stations in San Francisco, filtered on the GPU by
number of exits using the deck.gl ``DataFilterExtension``.

Only stations whose ``exits`` value falls within ``filter_range`` are drawn. Extension
options (here ``filter_size``) are passed to ``pdk.Extension``, while the props the
extension adds to the layer (``get_filter_value`` and ``filter_range``) are passed to the
``pdk.Layer``.

Adapted from the ScatterplotLayer example.
"""

import pydeck as pdk
import pandas as pd
import math

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
df = pd.read_json(DATA_URL)

# Use pandas to calculate additional data
df["exits_radius"] = df["exits"].apply(lambda exits_count: math.sqrt(exits_count))

# Only show stations with at least this many exits
MIN_EXITS = 5000

layer = pdk.Layer(
    "ScatterplotLayer",
    df,
    pickable=True,
    opacity=0.8,
    stroked=True,
    filled=True,
    radius_scale=6,
    radius_min_pixels=1,
    radius_max_pixels=100,
    line_width_min_pixels=1,
    get_position="coordinates",
    get_radius="exits_radius",
    get_fill_color=[255, 140, 0],
    get_line_color=[0, 0, 0],
    # Props added to the layer by the DataFilterExtension:
    get_filter_value="exits",
    filter_range=[MIN_EXITS, 100000],
    # The extension itself, with its own options:
    extensions=[pdk.Extension("DataFilterExtension", filter_size=1)],
)

# Set the viewport location
view_state = pdk.ViewState(latitude=37.7749295, longitude=-122.4194155, zoom=10, bearing=0, pitch=0)

# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\n{address}"})
r.to_html("data_filter_extension.html")
