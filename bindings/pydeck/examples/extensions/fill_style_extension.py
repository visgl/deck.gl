"""
FillStyleExtension
==================

Vancouver blocks filled with a repeating hatch pattern using the deck.gl
``FillStyleExtension``. The extension is enabled with ``pattern=True``; the layer supplies
the pattern atlas (a sprite sheet), its mapping, and a ``get_fill_pattern`` accessor.

Note: ``fill_pattern_atlas`` must point at a publicly hosted sprite sheet. The mapping
below matches the atlas used by deck.gl's render tests
(``test/data/pattern.png``); host that image (or your own) and update the URL.
"""

import pandas as pd
import pydeck as pdk

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json"
df = pd.read_json(DATA_URL)

# TODO: host this sprite sheet in deck.gl-data and update the URL.
FILL_PATTERN_ATLAS = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pattern.png"
FILL_PATTERN_MAPPING = {
    "hatch-1x": {"x": 4, "y": 4, "width": 120, "height": 120, "mask": True},
    "hatch-2x": {"x": 132, "y": 4, "width": 120, "height": 120, "mask": True},
    "hatch-cross": {"x": 4, "y": 132, "width": 120, "height": 120, "mask": True},
    "dots": {"x": 132, "y": 132, "width": 120, "height": 120, "mask": True},
}

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
