from pydeck import Deck, Layer, ViewState


def create_scatterplot_test_object():
    view_state = ViewState(latitude=0, longitude=0, zoom=12)
    layers = [
        Layer(
            "ScatterplotLayer",
            id="scatterplot",
            data=[[0, 0], [0.01, 0.01]],
            get_position="-",
            get_radius=500,
            get_fill_color=[255, 0, 0],
        )
    ]
    return Deck(layers=layers, initial_view_state=view_state, map_style=None, views=None)
