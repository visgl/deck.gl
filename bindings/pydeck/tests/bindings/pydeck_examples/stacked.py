import pandas as pd

from pydeck import Deck, Layer, ViewState


data = [
    {"position": [-0.002, 0.002], "rgb": [136, 45, 97]},
    {"position": [-0.002, -0.002], "rgb": [170, 57, 57]},
    {"position": [0.002, -0.002], "rgb": [45, 136, 45]},
    {"position": [0.002, 0.002], "rgb": [123, 159, 53]},
]

df = pd.DataFrame([{"position": [0, 0], "text": "Test"}, {"position": [0.002, 0], "text": "Testing"}])


def create_stacked_test_object():
    view_state = ViewState(max_zoom=20, zoom=15)
    scatterplot = Layer(
        "ScatterplotLayer", data=data, get_position="position", get_radius=100, id="first", getColor="rgb",
    )
    text_layer = Layer(
        "TextLayer",
        data=df,
        id="second",
        font_size=144,
        get_color=[0, 0, 255],
        get_position="position",
        get_text_anchor="`start`",
        font_family="`Times, Times New Roman, Georgia, serif`",
    )
    return Deck(
        description="Test of plotting multiple layers at once",
        layers=[scatterplot, text_layer],
        initial_view_state=view_state,
        views=None,
        map_style=None,
    )
