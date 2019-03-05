from components import (
    Layer,
    LightSettings,
    ViewState,
    View,
    Renderer,
    json_tools,
)

# Example that produces JSON from a set of python objects
layer = Layer(
    'HexagonLayer',
    'heatmap',
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv',
    elevation_scale=50,
    elevation_range=[0, 3000],
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
view_state = ViewState(0, 0, 10)
view = View('MapView', True)
r = Renderer(layers=[layer], initial_view_state=view_state, views=[view])
json_tools.to_json(r)
