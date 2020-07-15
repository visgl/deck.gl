"""
LineLayer
=========

Flights from Heathrow around Europe, adapted from the deck.gl documentation.
"""

import pydeck as pdk

DATA_URL = {
    "AIRPORTS": "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json",
    "FLIGHT_PATHS": "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/heathrow-flights.json",  # noqa
}

INITIAL_VIEW_STATE = pdk.ViewState(latitude=47.65, longitude=7, zoom=4.5, max_zoom=16, pitch=50, bearing=0)

# RGBA value generated in Javascript by deck.gl's Javascript expression parser
GET_COLOR_JS = [
    "255 * (1 - (start[2] / 10000) * 2)",
    "128 * (start[2] / 10000)",
    "255 * (start[2] / 10000)",
    "255 * (1 - (start[2] / 10000))",
]

scatterplot = pdk.Layer(
    "ScatterplotLayer",
    DATA_URL["AIRPORTS"],
    radius_scale=20,
    get_position="coordinates",
    get_fill_color=[255, 140, 0],
    get_radius=60,
    pickable=True,
)

line_layer = pdk.Layer(
    "LineLayer",
    DATA_URL["FLIGHT_PATHS"],
    get_source_position="start",
    get_target_position="end",
    get_color=GET_COLOR_JS,
    get_width=10,
    highlight_color=[255, 255, 0],
    picking_radius=10,
    auto_highlight=True,
    pickable=True,
)

layers = [scatterplot, line_layer]

r = pdk.Deck(layers=layers, initial_view_state=INITIAL_VIEW_STATE)
r.to_html("line_layer.html")
