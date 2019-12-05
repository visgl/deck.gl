from .json_tools import JSONMixin

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
    def __init__(
        self,
        type=None,
        controller=None
    ):
        self.type = type
        self.controller = controller
