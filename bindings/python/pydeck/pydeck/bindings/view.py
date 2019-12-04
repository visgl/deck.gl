from .json_tools import JSONMixin

TYPE_IDENTIFIER = '@@type'

class View(JSONMixin):
    """
    Represents a "hard configuration" of a camera location

    Parameters
    ---------
    type : str, default "MapView"
        deck.gl view to display, e.g., MapView
    controller : bool, default True
        If enabled, camera becomes interactive.
    """
    def __init__(
        self,
        type='MapView',
        controller=True
    ):
        self.type = type
        self.controller = controller

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
