"""
ClipExtension
=============

BART lines clipped to a rectangular bounding box using the deck.gl ``ClipExtension``.
Only the portions of each path that fall inside ``clip_bounds`` (``[west, south, east,
north]`` in the layer's coordinate system) are drawn.
"""

import pandas as pd
import pydeck as pdk

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json"
df = pd.read_json(DATA_URL)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return [int(h[i : i + 2], 16) for i in (0, 2, 4)]


df["color"] = df["color"].apply(hex_to_rgb)

layer = pdk.Layer(
    "PathLayer",
    df,
    pickable=True,
    get_color="color",
    width_scale=20,
    width_min_pixels=3,
    get_path="path",
    get_width=5,
    # Props added to the layer by the ClipExtension:
    clip_bounds=[-122.45, 37.72, -122.15, 37.88],
    extensions=[pdk.Extension("ClipExtension")],
)

view_state = pdk.ViewState(latitude=37.80, longitude=-122.30, zoom=10)
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}"})
r.to_html("clip_extension.html")
