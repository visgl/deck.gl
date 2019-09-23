"""Corresponds to https://deck.gl/#/examples/core-layers/hexagon-layer"""
import pydeck

DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'

INITIAL_VIEW_STATE = pydeck.ViewState(
    longitude=-1.4157267858730052,
    latitude=52.232395363869415,
    zoom=6.6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.396674584323023
)

COLOR_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
]


layer = pydeck.Layer(
    'HexagonLayer',
    DATA_URL,
    id='heatmap',
    color_range=COLOR_RANGE,
    coverage=1,
    elevationRange=[0, 3000],
    elevationScale='{min: 1, max: 50}',
    extruded=True,
    get_position='[lng, lat]',
    opacity=1,
    pickable=True,
    radius=1000,
    upper_percentile=100,
)

r = pydeck.Deck(
    layers=[layer],
    initial_view_state=INITIAL_VIEW_STATE
)
r.to_html()
