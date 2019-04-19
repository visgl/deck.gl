from .json_tools import to_json

from .layer import Layer
from .light_settings import LightSettings
from .view import View
from .view_state import ViewState


class Deck():
    def __init__(
        self,
        layers=[],
        views=[],
        map_style='mapbox://styles/mapbox/dark-v9',
        light_settings=[],
        initial_view_state=None
    ):
        self.layers = layers
        self.views = views
        self.map_style = map_style
        self.initial_view_state = initial_view_state
        self.light_settings = light_settings

    def __add__(self, obj):
        if isinstance(Layer, obj):
            self.layers.append(obj)
        elif isinstance(View, obj):
            self.views.append(obj)
        elif isinstance(ViewState, obj):
            self.initial_view_state = obj
        elif isinstance(LightSettings, obj):
            self.light_setttings = obj
        obj_type = type(obj).__name__
        raise TypeError('Cannot join object of type', obj_type)

    def __repr__(self):
        return to_json(self)
