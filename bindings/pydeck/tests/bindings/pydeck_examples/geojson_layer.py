from pydeck import Deck, Layer, ViewState

features = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.42923736572264, 37.80544394934271],
                        [0, 37.80544394934271],
                        [-122.42923736572264, 0],
                        [-122.42923736572264, 37.80544394934271],
                    ]
                ],
            },
        }
    ],
}


def create_geojson_layer_test_object():
    return Deck(
        description="Test of GeoJsonLayer",
        map_style=None,
        initial_view_state=ViewState(longitude=-122.45, latitude=37.8, zoom=0),
        layers=[
            Layer(
                "GeoJsonLayer",
                id="geojson-layer",
                data=features,
                stroked=True,
                filled=True,
                line_width_min_pixels=2,
                opacity=0.4,
                get_line_color=[255, 100, 100],
                get_fill_color=[200, 160, 0, 180],
            )
        ],
        map_provider=None,
        views=None,
    )
