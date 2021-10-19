"""
ScenegraphLayer
===============

Visualization featuring a custom scenegraph animation
"""


import pandas as pd

from pydeck import Layer, Deck
from pydeck.data_utils import compute_view
from pydeck.types import String

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
SCENEGRAPH_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb"

# Automatically fit viewport location based on data
df = pd.read_json(DATA_URL)
view = compute_view(df["coordinates"])

layer = Layer(
    type="ScenegraphLayer",
    id="scenegraph-layer",
    data=DATA_URL,
    pickable=True,
    scenegraph=SCENEGRAPH_URL,
    get_position="coordinates",
    get_orientation=[0, 180, 90],
    size_scale=500,
    _animations={"*": {"speed": 5}},
    _lighting=String("pbr"),
)

# Render
r = Deck(layer, initial_view_state=view)
r.to_html("scenegraph_layer.html")
