from pydeck import Deck, Layer, LightSettings, View, ViewState


def create_minimal_test_object():
    lights = LightSettings(
        lights_position=[-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], ambient_ratio=0.4, diffuse_ratio=0.6,
    )
    layer = Layer(
        "HexagonLayer",
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv",
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
