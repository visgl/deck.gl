"""
PathStyleExtension
==================

Bay Area Rapid Transit (BART) lines drawn as dashed paths using the deck.gl
``PathStyleExtension``.

The dash behaviour is enabled on the extension (``dash=True``), while the props the
extension adds to the layer (``get_dash_array`` and ``dash_justified``) are passed to the
``pdk.Layer``.

Adapted from the PathLayer example.
"""

import pandas as pd
import pydeck as pdk

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json"
df = pd.read_json(DATA_URL)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


df["color"] = df["color"].apply(hex_to_rgb)

view_state = pdk.ViewState(latitude=37.782556, longitude=-122.3484867, zoom=10)

layer = pdk.Layer(
    type="PathLayer",
    data=df,
    pickable=True,
    get_color="color",
    width_scale=20,
    width_min_pixels=3,
    get_path="path",
    get_width=5,
    # Props added to the layer by the PathStyleExtension:
    get_dash_array=[8, 4],
    dash_justified=True,
    # The extension itself, with its own options:
    extensions=[pdk.Extension("PathStyleExtension", dash=True)],
)

r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}"})
r.to_html("path_style_extension.html")
