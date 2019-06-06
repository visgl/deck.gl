import uuid

from .json_tools import JSONMixin

DEFAULT_COLOR_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
]


AGGREGATE_LAYERS = [
    'HexagonLayer',
    'ScreenGridLayer',
]


def is_aggregate_layer(layer_name):
    return layer_name in AGGREGATE_LAYERS


class Layer(JSONMixin):
    """
    A deck.gl Layer for rendering

    Note that some parameters only apply to certain layers

    Parameters
    ---------
    type : str
        Type of layer to render, e.g., `HexagonLayer`
    id : str
        Unique name for layer
    data : list or str
        Either a URL of data to load in or an array of data
    get_color : str or list of float
        String representing field name of color or float representing the desired color
    get_position : str, default '-'
        Name of position field
    radius : int
        Size of circle in a HexagonLayer or other aggregation layer
    get_radius : int or str
        Radius of a circle as either an integer or a data field name
    coverage : float, default None
        Valid only on HexagonLayer
        Hexagon radius multiplier, clamped between 0 - 1.
        The final radius of hexagon is calculated by coverage * radius.
    elevation_range : list
        Valid only on HexagonLayer
        Elevation scale output range
    elevation_scale : float
        Valid only on HexagonLayer
        Hexagon elevation multiplier
    extruded : bool
        Boolean to determine if layer rises from map. Defaults to `True` for aggregate layers.
    """
    def __init__(
        self,
        type,
        data,
        id=None,
        get_position="-",
        color_range=None,
        opacity=1,
        radius=1000,
        get_radius=None,
        light_settings=None,
        coverage=None,
        elevation_range=None,
        elevation_scale=None,
        extruded=None,
        upper_percentile=100,
        get_fill_color=None,
        get_color=None,
    ):
        self.type = type
        self.id = id or str(uuid.uuid4())
        self.data = data
        self.coverage = coverage
        self.elevation_range = elevation_range
        self.elevation_scale = elevation_scale
        self.extruded = extruded
        self.get_position = get_position
        self.opacity = opacity
        self.get_radius = get_radius or radius
        self.get_color = get_color
        self.get_fill_color = get_fill_color
        if is_aggregate_layer(type):
            self.radius = radius
            self.upper_percentile = upper_percentile
            self.color_range = color_range or DEFAULT_COLOR_RANGE
            self.light_settings = light_settings
            self.extruded = extruded if extruded is not None else True
