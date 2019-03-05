from deck_bindings.components import (
    Layer,
    LightSettings,
    ViewState,
    View,
    Renderer,
    json_tools,
)


FIXTURE_STRING = '{"layers": [{"opacity": 1, "elevationScale": 50, "coverage": 1, "elevationRange": [0, 3000], "extruded": true, "lightSettings": {"numberOfLights": 2, "lightsPosition": [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], "diffuseRatio": 0.6, "ambientRatio": 0.4}, "data": "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv", "upperPercentile": 100, "radius": 1000, "getPosition": "-", "type": "HexagonLayer", "id": "heatmap", "colorRange": [[1, 152, 189], [73, 227, 206], [216, 254, 181], [254, 237, 177], [254, 173, 84], [209, 55, 78]]}], "mapStyle": "mapbox://styles/mapbox/dark-v9", "views": [{"controller": true, "type": "MapView"}], "initialViewState": {"bearing": -27.396674584323023, "minZoom": 5, "zoom": 6.6, "longitude": -1.4157267858730052, "maxZoom": 15, "pitch": 40.5, "latitude": 52.232395363869415}}' # noqa


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
        diffuse_ratio=0.6
    )
    layer.light_settings = lights
    view_state = ViewState(
        longitude=-1.4157267858730052,
        latitude=52.232395363869415,
        zoom=6.6,
        min_zoom=5,
        max_zoom=15,
        pitch=40.5,
        bearing=-27.396674584323023)
    view = View('MapView', True)
    r = Renderer(layers=[layer], initial_view_state=view_state, views=[view])
    assert json_tools.to_json(r) == FIXTURE_STRING
