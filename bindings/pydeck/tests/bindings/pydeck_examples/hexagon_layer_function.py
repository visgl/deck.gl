from pydeck import Deck, Layer, View, ViewState

color_range = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
]

data = [
    {"lat": 0, "lon": 0},
    {"lat": 0, "lon": 0},
    {"lat": 0, "lon": 0},
    {"lat": 0, "lon": 1},
    {"lat": 0.1, "lon": 1},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 0.2, "lon": 1.2},
    {"lat": 0.2, "lon": 1.2},
    {"lat": 0.2, "lon": 1.2},
    {"lat": 0.2, "lon": 1.2},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 0.1, "lon": 0.1},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
    {"lat": 1.2, "lon": 1.2},
]


def create_heatmap_test_object():
    DESCRIPTION = "HexagonLayer without a function string should fail but HeatmapLayer should succeed"
    # This actually shouldn't render
    # Tries to detect if strings are being interpreted by the
    # expression parser in @deck.gl/json
    failed_hexagon_layer = Layer(
        type="HexagonLayer",
        id="failed-heatmap",
        data=data,
        elevation_range=[0, 15],
        elevation_scale=1800,
        get_position="'[lon, lat]'",
        radius=10000,
        upper_percentile=100,
        color_range=color_range,
    )
    # This will render
    successful_heatmap_layer = Layer(
        type="HeatmapLayer", id="successful-heatmap", data=data, get_position=["lon", "lat"], color_range=color_range,
    )

    return Deck(
        description=DESCRIPTION,
        initial_view_state=ViewState(
            **{"longitude": 0, "latitude": 0, "zoom": 5, "pitch": 40.5, "bearing": -27.396674584323023}
        ),
        views=[View(type="MapView", controller=True)],
        layers=[failed_hexagon_layer, successful_heatmap_layer],
        map_style=None,
    )
