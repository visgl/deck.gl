from pydeck import Deck, Effect, Layer, View, ViewState


def create_minimal_test_object():
    lighting = Effect(
        "LightingEffect",
        ambient=Effect("AmbientLight", intensity=0.4),
        point_light_1=Effect("PointLight", position=[-0.144528, 49.739968, 8000], intensity=0.6),
        point_light_2=Effect("PointLight", position=[-3.807751, 54.104682, 8000], intensity=0.6),
    )
    layer = Layer(
        "HexagonLayer",
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv",
        id="heatmap",
        elevation_scale=50,
        elevation_range=[0, 3000],
        extruded=True,
        coverage=1,
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
    return Deck(layers=[layer], effects=[lighting], initial_view_state=view_state, views=[view])
