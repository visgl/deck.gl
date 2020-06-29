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


def create_geojson_layer_with_gmaps_test_object():
    return Deck(
        description="Test of GeoJsonLayer, with Google Maps basemap",
        map_style="satellite",
        map_provider="google_maps",
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
        views=None,
    )


if __name__ == "__main__":
    create_geojson_layer_with_gmaps_test_object().to_html("test.html", offline=True)
