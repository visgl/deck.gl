"""
CollisionFilterExtension
========================

BART station labels decluttered with the deck.gl ``CollisionFilterExtension``. Overlapping
labels are hidden so the map stays readable; ``get_collision_priority`` keeps the busier
stations (higher ``exits``) when labels collide.

Collision options (``collision_enabled``, ``get_collision_priority``) are passed to the
layer.
"""

import pydeck as pdk
import pandas as pd

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
df = pd.read_json(DATA_URL)

layer = pdk.Layer(
    "TextLayer",
    df,
    pickable=True,
    get_position="coordinates",
    get_text="name",
    get_size=15,
    get_color=[255, 255, 255],
    background=True,
    get_background_color=[0, 0, 0, 160],
    # Props added to the layer by the CollisionFilterExtension:
    collision_enabled=True,
    get_collision_priority="exits",
    extensions=[pdk.Extension("CollisionFilterExtension")],
)

view_state = pdk.ViewState(latitude=37.775, longitude=-122.42, zoom=11)
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}"})
r.to_html("collision_filter_extension.html")
