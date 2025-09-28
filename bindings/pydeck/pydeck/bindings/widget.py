import uuid
from .json_tools import JSONMixin

TYPE_IDENTIFIER = "@@type"


class Widget(JSONMixin):
    """
    Represents a deck.gl widget, which are UI components around the WebGL2/WebGPU canvas
    to offer controls and information for a better user experience.

    Please see the deck.gl
    `Widget catalog <https://deck.gl/docs/api-reference/widgets/overview>`_
    to determine the particular parameters of your widget.

    Parameters
    ---------
    type : str, default None
        deck.gl widget to display, e.g., ``CompassWidget``
    id : str, default None
        Unique name for widget
    placement : str, default ``top-left``
        Placement of the widget on the map. Options are ``top-left``, ``top-right``, ``bottom-left``, ``bottom-right``, and ``fill``.
        Note that not all widgets support custom placement.
    view_id : str, default None
        ID of the view to which the widget should be added. The widget will be added to the default view if not specified.
        Note that not all widgets support custom view_id.
    **kwargs
        Any of the parameters passable to a deck.gl widget.
    """

    def __init__(self, type, id=None, placement=None, view_id=None, **kwargs):
        self.type = type
        self.id = id or str(uuid.uuid4())
        self.placement = placement
        self.view_id = view_id
        self.__dict__.update(kwargs)

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
