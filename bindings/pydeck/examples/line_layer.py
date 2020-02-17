import pydeck


DATA_URL = "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/heathrow-flights.json"

view_state = pydeck.ViewState(
    latitude=51.51, longitude=-0.11, zoom=8, max_zoom=16, pitch=50, bearing=0
)

line_layer = pydeck.Layer(
    type="LineLayer",
    data=DATA_URL,
    get_source_position="start",
    get_target_position="end",
    get_color=[21, 255, 255, 200],
    get_width=8,
    auto_highlight=True,
    pickable=True,
)

r = pydeck.Deck(layers=[line_layer], initial_view_state=view_state)
r.to_html("line_layer.html", notebook_display=False)
