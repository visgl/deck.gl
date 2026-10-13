"""
DataFilterExtension
===================

BART (Bay Area Rapid Transit) stations filtered on the GPU by number of exits using the
deck.gl ``DataFilterExtension``. Only stations whose ``exits`` value falls within
``filter_range`` are drawn.

Extension options (``filter_size``) are passed to ``pdk.Extension``, while the props the
extension adds to the layer (``get_filter_value`` and ``filter_range``) are passed to the
``pdk.Layer``.
"""

import pydeck as pdk
import pandas as pd
import math

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
df = pd.read_json(DATA_URL)
df["exits_radius"] = df["exits"].apply(math.sqrt)

layer = pdk.Layer(
    "ScatterplotLayer",
    df,
    pickable=True,
    opacity=0.8,
    stroked=True,
    filled=True,
    radius_scale=9,
    radius_min_pixels=2,
    radius_max_pixels=70,
    line_width_min_pixels=1,
    get_position="coordinates",
    get_radius="exits_radius",
    get_fill_color=[255, 140, 0],
    get_line_color=[0, 0, 0],
    # Props added to the layer by the DataFilterExtension:
    get_filter_value="exits",
    filter_range=[9000, 100000],
    # The extension itself, with its own options:
    extensions=[pdk.Extension("DataFilterExtension", filter_size=1)],
)

view_state = pdk.ViewState(latitude=37.79, longitude=-122.30, zoom=10, bearing=0, pitch=0)
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\n{address}"})
r.to_html("data_filter_extension.html")
