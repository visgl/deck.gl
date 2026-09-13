from .json_tools import JSONMixin

TYPE_IDENTIFIER = "@@type"


class View(JSONMixin):
    """
    Represents a "hard configuration" of a camera location

    Parameters
    ---------
    type : str, default None
        deck.gl view to display, e.g., MapView
    controller : bool or dict, default None
        If True, camera becomes interactive with default settings.
        If False, camera is not interactive.
        If dict, camera becomes interactive with specified settings.
        Supported settings include:
        - scrollZoom : bool or dict, enable/disable scroll zoom
        - doubleClickZoom : bool, enable/disable double click zoom
        - touchZoom : bool, enable/disable touch zoom
        - dragPan : bool, enable/disable drag pan
        - dragRotate : bool, enable/disable drag rotate
        - keyboard : bool or dict, enable/disable keyboard controls

        Example to disable scroll zoom::

            view = pdk.View('MapView', {'scrollZoom': False}) # or
            view = pdk.View(type='MapView', controller={'scrollZoom': False})

    **kwargs
        Any of the parameters passable to a deck.gl View
    """

    def __init__(self, type=None, controller=None, width=None, height=None, **kwargs):
        self.type = type
        self.controller = controller
        self.width = width
        self.height = height
        self.__dict__.update(kwargs)

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
