from pydeck import Deck, Layer, ViewState


def create_multi_layer_test_object():
    view_state = ViewState(latitude=-122.45, longitude=37.8, zoom=12)
    scatterplot = Layer(
        "ScatterplotLayer",
        id="scatterplot",
        data=[{"position": [-122.45, 37.8]}],
        get_position="position",
        get_fill_color=[255, 0, 0, 255],
        get_radius=1000,
    )
    text_layer = Layer(
        "TextLayer",
        id="textlayer",
        data=[{"position": [-122.45, 37.8], "text": "Hello World"}],
        get_position="position",
        get_text_anchor="`end`",
    )
    geojson_layer = Layer(
        "GeoJsonLayer",
        id="geojsonlayer",
        data={
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {"type": "Point", "coordinates": [-122.42923736572264, 37.80544394934271]},
                }
            ],
        },
        stroked=True,
        filled=True,
        line_width_min_pixels=2,
        opacity=0.4,
        get_line_color=[255, 100, 100],
        get_fill_color=[200, 160, 0, 180],
    )
    return Deck(layers=[scatterplot, text_layer, geojson_layer], initial_view_state=view_state)
