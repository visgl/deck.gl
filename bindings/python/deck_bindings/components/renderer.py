class Renderer():
    def __init__(
        self,
        layers=[],
        views=[],
        map_style='mapbox://styles/mapbox/dark-v9',
        initial_view_state=None
    ):
        self.layers = layers
        self.views = views
        self.map_style = map_style
        self.initial_view_state = initial_view_state
