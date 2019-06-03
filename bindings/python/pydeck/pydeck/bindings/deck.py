from .json_tools import JSONMixin

from .layer import Layer
from .view import View
from .view_state import ViewState
from ..widget import DeckGLWidget


class Deck(JSONMixin):
    """
    Data visualization configuration

    Wrapper around deck.gl JSON API bindings

    Parameters
    ---------
    layers : array, default []
        list of pydeck.Layer objects to render
    views : array, default [View()]
        list of pydeck.View objects to render
    map_style : str, default "mapbox://styles/mapbox/dark-v9"
        Style of basemap
    initial_view_state : pydeck.ViewState, default [pydeck.ViewState()]
        Initial camera angle relative to the map
    """
    def __init__(
        self,
        layers=[],
        views=[View()],
        map_style='mapbox://styles/mapbox/dark-v9',
        initial_view_state=ViewState(),
    ):
        self.layers = layers
        self.views = views
        self.map_style = map_style
        self.initial_view_state = initial_view_state
        self.deck_widget = DeckGLWidget()


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
        else:
            obj_type = type(obj).__name__
            raise TypeError("Cannot join object of type", obj_type)

    def show(self):
        """
        Displays current Deck object for a Jupyter notebook
        """
        self.update()
        return self.deck_widget

    def update(self):
        self.deck_widget.json_input = self.to_json()
