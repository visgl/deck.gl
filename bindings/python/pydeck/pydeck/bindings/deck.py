from .json_tools import to_json

from .layer import Layer
from .light_settings import LightSettings
from .view import View
from .view_state import ViewState


class Deck():
    """
    Data visualization configuration

    Wrapper around deck.gl JSON API bindings

    Parameters
    ---------
    layers : array, default []
        list of pydeck.Layer objects to render
    views : array, default []
        list of pydeck.View objects to render
    map_style : str, default "mapbox://styles/mapbox/dark-v9"
        Style of basemap
    initial_view_state : pydeck.ViewState, default None
        Initial camera angle relative to the map
    light_settings : array, default []
        Settings for lights around the map, given by a pydeck.LightSettings object
    """
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
        """
        Override of the addition operator to add attributes to the Deck object
        """
        if isinstance(Layer, obj):
            self.layers.append(obj)
        elif isinstance(View, obj):
            self.views.append(obj)
        elif isinstance(ViewState, obj):
            self.initial_view_state = obj
        elif isinstance(LightSettings, obj):
            self.light_setttings = obj
        obj_type = type(obj).__name__
        raise TypeError("Cannot join object of type", obj_type)

    def __repr__(self):
        """
        Override of string representation method to return a JSON-ified version of the
        Deck object.
        """
        return to_json(self)

    def to_json(self):
        """
        Return a JSON-ified version of the Deck object.
        """
        return to_json(self)
