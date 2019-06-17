import json

from pydeck import (
    Layer,
    LightSettings,
    ViewState,
    View,
    Deck
)


FIXTURE_STRING = """{"initialViewState": {"bearing": -27.396674584323023, "latitude": 52.232395363869415, "longitude": -1.4157267858730052, "maxZoom": 15, "minZoom": 5, "pitch": 40.5, "zoom": 6.6}, "layers": [{"colorRange": [[1, 152, 189], [73, 227, 206], [216, 254, 181], [254, 237, 177], [254, 173, 84], [209, 55, 78]], "coverage": 1, "data": "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv", "elevationRange": [0, 3000], "elevationScale": 50, "extruded": true, "getColor": [0, 0, 0, 255], "getFillColor": [0, 0, 0, 255], "getLineColor": [0, 0, 0, 255], "getPosition": "-", "getRadius": 1000, "id": "heatmap", "lightSettings": {"ambientRatio": 0.4, "diffuseRatio": 0.6, "lightsPosition": [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], "numberOfLights": 2}, "opacity": 1, "radius": 1000, "stroked": false, "type": "HexagonLayer"}], "mapStyle": "mapbox://styles/mapbox/dark-v9", "views": [{"controller": true, "type": "MapView"}]}"""

lights = LightSettings(
    lights_position=[
        -0.144528,
        49.739968,
        8000,
        -3.807751,
        54.104682,
        8000],
    ambient_ratio=0.4,
    diffuse_ratio=0.6)
layer = Layer(
    'HexagonLayer',
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv',
    id='heatmap',
    elevation_scale=50,
    elevation_range=[0, 3000],
    extruded=True,
    coverage=1,
    light_settings=lights)
view_state = ViewState(
    longitude=-1.4157267858730052,
    latitude=52.232395363869415,
    zoom=6.6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.396674584323023)
view = View(type='MapView', controller=True)
deck = Deck(layers=[layer], initial_view_state=view_state, views=[view])


def test_json_output():
    """Verify that the JSON rendering produces an @deck.gl/json library-compliant JSON object"""
    assert str(deck) == json.dumps(json.loads(FIXTURE_STRING), sort_keys=True)


def test_update():
    """Verify that calling `update` changes the Deck object"""
    view_state.latitude, view_state.longitude = 0, 0
    deck.update()
    # Create relevant results string
    expected_results = json.loads(FIXTURE_STRING)
    expected_results['initialViewState']['latitude'] = 0
    expected_results['initialViewState']['longitude'] = 0
    assert str(deck) == json.dumps(expected_results, sort_keys=True)
