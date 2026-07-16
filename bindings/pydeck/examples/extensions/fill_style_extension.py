"""
FillStyleExtension
==================

Vancouver blocks filled with a repeating hatch pattern using the deck.gl
``FillStyleExtension``. The extension is enabled with ``pattern=True``; the layer supplies
the pattern atlas (a sprite sheet), its mapping, and a ``get_fill_pattern`` accessor.

The pattern atlas and mapping are the sprite sheet deck.gl ships for its own examples and
render tests.
"""

import pandas as pd
import pydeck as pdk

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json"
df = pd.read_json(DATA_URL)

DECKGL_RAW = "https://raw.githubusercontent.com/visgl/deck.gl/master"
FILL_PATTERN_ATLAS = DECKGL_RAW + "/test/data/pattern.png"
FILL_PATTERN_MAPPING = DECKGL_RAW + "/test/data/pattern.json"

layer = pdk.Layer(
    "GeoJsonLayer",
    df,
    pickable=True,
    filled=True,
    stroked=True,
    get_fill_color=[255, 180, 0],
    get_line_color=[255, 255, 255],
    line_width_min_pixels=1,
    # Props added to the layer by the FillStyleExtension:
    fill_pattern_atlas=FILL_PATTERN_ATLAS,
    fill_pattern_mapping=FILL_PATTERN_MAPPING,
    get_fill_pattern="'hatch-cross'",
    get_fill_pattern_scale=6,
    get_fill_pattern_offset=[0, 0],
    extensions=[pdk.Extension("FillStyleExtension", pattern=True)],
)

view_state = pdk.ViewState(latitude=49.253, longitude=-123.13, zoom=11.3)
r = pdk.Deck(layers=[layer], initial_view_state=view_state)
r.to_html("fill_style_extension.html")
