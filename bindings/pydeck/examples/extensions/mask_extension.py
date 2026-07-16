"""
MaskExtension
=============

BART stations masked by a polygon using the deck.gl ``MaskExtension``. A
``SolidPolygonLayer`` with ``operation="mask"`` defines the mask; the ``ScatterplotLayer``
references it via ``mask_id`` and the extension, so only points inside the polygon render.

MaskExtension is a two-layer pattern: the mask layer is not drawn, it only constrains the
layers that reference its ``id``.
"""

import pydeck as pdk
import pandas as pd
import math

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
df = pd.read_json(DATA_URL)
df["exits_radius"] = df["exits"].apply(math.sqrt)

# A box over the San Francisco peninsula; only stations inside it will be shown
mask_polygon = [[[-122.46, 37.74], [-122.36, 37.74], [-122.36, 37.83], [-122.46, 37.83]]]

mask_layer = pdk.Layer(
    "SolidPolygonLayer",
    [{"polygon": mask_polygon[0]}],
    id="sf-mask",
    get_polygon="polygon",
    operation="mask",
)

stations = pdk.Layer(
    "ScatterplotLayer",
    df,
    pickable=True,
    filled=True,
    radius_scale=9,
    radius_min_pixels=4,
    get_position="coordinates",
    get_radius="exits_radius",
    get_fill_color=[255, 80, 120],
    # Props added to the layer by the MaskExtension:
    mask_id="sf-mask",
    extensions=[pdk.Extension("MaskExtension")],
)

view_state = pdk.ViewState(latitude=37.79, longitude=-122.30, zoom=10)
r = pdk.Deck(layers=[mask_layer, stations], initial_view_state=view_state, tooltip={"text": "{name}"})
r.to_html("mask_extension.html")
