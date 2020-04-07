from .json_tools import JSONMixin

TYPE_IDENTIFIER = "@@type"


class View(JSONMixin):
    """
    Represents a "hard configuration" of a camera location

    Parameters
    ---------
    type : str, default None
        deck.gl view to display, e.g., MapView
    controller : bool, default None
        If enabled, camera becomes interactive.
    """

    def __init__(self, type=None, controller=None):
        self.type = type
        self.controller = controller

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
