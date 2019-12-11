import pytest

import json
import os

from pydeck import Layer, LightSettings, ViewState, View, Deck
from ..fixtures import fixtures


def create_minimal_test_object():
    lights = LightSettings(
        lights_position=[-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
        ambient_ratio=0.4,
        diffuse_ratio=0.6,
    )
    layer = Layer(
        "HexagonLayer",
        "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv",
        id="heatmap",
        elevation_scale=50,
        elevation_range=[0, 3000],
        extruded=True,
        coverage=1,
        light_settings=lights,
    )
    view_state = ViewState(
        longitude=-1.4157267858730052,
        latitude=52.232395363869415,
        zoom=6.6,
        min_zoom=5,
        max_zoom=15,
        pitch=40.5,
        bearing=-27.396674584323023,
    )
    view = View(type="MapView", controller=True)
    return Deck(layers=[layer], initial_view_state=view_state, views=[view])


def create_multi_layer_test_object():
    view_state = ViewState(latitude=-122.45, longitude=37.8, zoom=12)
    scatterplot = Layer(
        "ScatterplotLayer",
        id='scatterplot',
        data=[{"position": [-122.45, 37.8]}],
        get_position='position',
        get_fill_color=[255, 0, 0, 255],
        get_radius=1000,
    )
    text_layer = Layer(
        "TextLayer",
        id='textlayer',
        data=[{"position": [-122.45, 37.8], "text": "Hello World"}],
        get_position='position',
        get_text_anchor="end",
    )
    geojson_layer = Layer(
        "GeoJsonLayer",
        id='geojsonlayer',
        data={
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.42923736572264, 37.80544394934271],
                    },
                }
            ],
        },
        stroked=True,
        filled=True,
        get_position='features.geometry.coordinates',
        line_width_min_pixels=2,
        opacity=0.4,
        get_line_color=[255, 100, 100],
        get_fill_color=[200, 160, 0, 180],
    )
    return Deck(layers=[scatterplot, text_layer, geojson_layer], initial_view_state=view_state)


def test_warning():
    """Verify that a warning is emitted when no Mapbox API key is set"""
    _environ = dict(os.environ)
    try:
        if os.environ.get("MAPBOX_API_KEY"):
            del os.environ["MAPBOX_API_KEY"]
        with pytest.warns(UserWarning) as record:
            d = Deck()
            os.environ["MAPBOX_API_KEY"] = "pk.xx"
            d = Deck()
        # Assert that only one warning has been raised
        assert len(record) == 1
    finally:
        os.environ.clear()
        os.environ.update(_environ)


def test_json_output():
    """Verify that the JSON rendering produces an @deck.gl/json library-compliant JSON object"""
    deck = create_minimal_test_object()
    assert str(deck) == json.dumps(json.loads(fixtures["minimal"]), sort_keys=True)
    deck = create_multi_layer_test_object()
    assert str(deck) == json.dumps(json.loads(fixtures["multilayers"]), sort_keys=True)


def test_update():
    """Verify that calling `update` changes the Deck object"""
    deck = create_minimal_test_object()
    deck.initial_view_state.latitude, deck.initial_view_state.longitude = 0, 0
    deck.update()
    # Create relevant results string
    expected_results = json.loads(fixtures["minimal"])
    expected_results["initialViewState"]["latitude"] = 0
    expected_results["initialViewState"]["longitude"] = 0
    assert str(deck) == json.dumps(expected_results, sort_keys=True)
