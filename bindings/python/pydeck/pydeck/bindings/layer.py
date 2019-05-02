from .json_tools import JSONMixin

DEFAULT_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
]


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
    get_position : str, default '-'
        Name of position field
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
    """
    def __init__(
        self,
        type,
        id,
        data,
        get_position="-",
        color_range=DEFAULT_RANGE,
        opacity=1,
        radius=1000,
        light_settings=None,
        coverage=None,
        elevation_range=None,
        elevation_scale=None,
        extruded=True,
        upper_percentile=100,
    ):
        self.type = type
        self.id = id
        self.data = data
        self.coverage = coverage
        self.elevation_range = elevation_range
        self.elevation_scale = elevation_scale
        self.extruded = extruded
        self.get_position = get_position
        self.opacity = opacity
        self.radius = radius
        self.upper_percentile = upper_percentile
        self.color_range = color_range
        self.light_settings = light_settings
