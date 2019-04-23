from .json_tools import JSONMixin

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
