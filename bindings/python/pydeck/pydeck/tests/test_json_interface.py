import json

from ..bindings import (
    Layer,
    LightSettings,
    ViewState,
    View,
    Deck
)


FIXTURE_STRING = '{"layers": [{"type": "HexagonLayer", "id": "heatmap", "data": "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv", "coverage": 1, "extruded": true, "opacity": 1, "radius": 1000, "elevationRange": [0, 3000], "elevationScale": 50, "getPosition": "-", "upperPercentile": 100, "colorRange": [[1, 152, 189], [73, 227, 206], [216, 254, 181], [254, 237, 177], [254, 173, 84], [209, 55, 78]], "lightSettings": {"diffuseRatio": 0.6, "lightsPosition": [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], "ambientRatio": 0.4, "numberOfLights": 2}}], "views": [{"type": "MapView", "controller": true}], "lightSettings": [], "mapStyle": "mapbox://styles/mapbox/dark-v9", "initialViewState": {"longitude": -1.4157267858730052, "latitude": 52.232395363869415, "zoom": 6.6, "pitch": 40.5, "bearing": -27.396674584323023, "minZoom": 5, "maxZoom": 15}}' # noqa


def test_json_output():
    layer = Layer(
        'HexagonLayer',
        'heatmap',
        'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv',
        elevation_scale=50,
        elevation_range=[0, 3000],
        extruded=True,
        coverage=1)
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
    layer.light_settings = lights
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
    assert str(deck) == json.dumps(json.loads(FIXTURE_STRING), sort_keys=True)
