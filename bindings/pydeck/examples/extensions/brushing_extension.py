"""
BrushingExtension
=================

BART stations revealed within a brush around the cursor using the deck.gl
``BrushingExtension``. Move the mouse over the map: only points within ``brushing_radius``
(in meters) of the pointer are shown.

Brushing options (``brushing_enabled``, ``brushing_radius``, ``brushing_target``) are
passed to the layer; the extension itself takes no options here.
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
    filled=True,
    radius_scale=9,
    radius_min_pixels=4,
    get_position="coordinates",
    get_radius="exits_radius",
    get_fill_color=[0, 200, 255],
    # Props added to the layer by the BrushingExtension:
    brushing_enabled=True,
    brushing_radius=20000,
    brushing_target="source",
    extensions=[pdk.Extension("BrushingExtension")],
)

view_state = pdk.ViewState(latitude=37.79, longitude=-122.30, zoom=10, bearing=0, pitch=0)
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\n{address}"})
r.to_html("brushing_extension.html")
