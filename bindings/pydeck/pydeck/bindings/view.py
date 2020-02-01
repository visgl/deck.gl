from .json_tools import JSONMixin

TYPE_IDENTIFIER = '@@type'

class View(JSONMixin):
    """
    Represents a "hard configuration" of a camera location

    Parameters
    ---------
    type : str, default None
        deck.gl view to display, e.g., MapView
    map_style : str, default None
        URI for Mapbox basemap style. See Mapbox's `gallery <https://www.mapbox.com/gallery/>`_ for examples.
        If not using a basemap, you can set this value to to an empty string, `''`.
    controller : bool, default None
        If enabled, camera becomes interactive.
    """
    def __init__(
        self,
        type=None,
        id=None,
        map_style=None,
        controller=None,
        height=None,
        width=None,
        clear=None,
        x=None,
        y=None,
        view_state=None,
        **kwargs
    ):
        self.type = type
        self.controller = controller
        self.map_style = map_style
        self.view_state = view_state
        self.x = x
        self.y = y
        self.clear = clear
        self.height = height

        if kwargs:
            self.__dict__.update(kwargs)

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
