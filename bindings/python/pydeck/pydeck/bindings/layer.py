import uuid

from ..data_utils import is_pandas_df
from .json_tools import JSONMixin

AGGREGATE_LAYERS = ['HexagonLayer', 'ScreenGridLayer']


def is_aggregate_layer(layer_name):
    return layer_name in AGGREGATE_LAYERS


class Layer(JSONMixin):
    """
    A deck.gl Layer for rendering

    Note that some parameters only apply to certain layers

    """
    def __init__(
        self,
        type,
        data,
        id=None,
        get_position='[lng,lat]',
        color_range=None,
        opacity=None,
        radius=None,
        get_radius=None,
        light_settings=None,
        coverage=None,
        elevation_range=None,
        elevation_scale=None,
        extruded=None,
        upper_percentile=None,
        get_fill_color=None,
        get_color=None,
        stroked=None,
        filled=None,
        radius_scale=None,
        radius_min_pixels=None,
        radius_max_pixels=None,
        line_width_units=None,
        line_width_scale=None,
        get_line_width=None,
        get_line_color=None,
        line_width_min_pixels=None,
        line_width_max_pixels=None,
        # TextLayer
        size_scale=None,
        size_units=None,
        size_min_pixels=None,
        billboard=None,
        font_family=None,
        character_set=None,
        font_weight=None,
        get_text=None,
        get_angle=None,
        # PointCloudLayer
        coordinate_system=None,
        get_normal=None,
        radius_pixels=None,
        **kwargs
    ):
        """Constructs a Layer object

        Parameters
        ---------
        type : str
            Type of layer to render, e.g., `HexagonLayer`
        id : str
            Unique name for layer
        data : str or :obj:`list` of :obj:`dict`
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
            *Valid only on HexagonLayer.* Hexagon radius multiplier,
            clamped between 0 - 1.
            The final radius of hexagon is calculated by coverage * radius.
        elevation_range : :obj:`list` :obj:`int`
            *Valid only on HexagonLayer.* Elevation scale output range
        elevation_scale : float
            *Valid only on HexagonLayer.* Hexagon elevation multiplier.
        extruded : bool
            Boolean to determine if layer rises from map. Defaults to `True` for aggregate layers.
        get_fill_color : :obj:`list` of `float` or str
            *Not valid on all deck.gl layers.* Specifies fill color as an RGBA value or field name in the data.
        stroked : bool, default None
            *Valid on ScatterplotLayer.* Draw online the outline of a point
        filled : bool, default True
            *Valid on ScatterplotLayer.* Draw the filled area of a point
        radius_scale : int, default 1
            Global radius multiplier for all points
        radius_min_pixels : int, default None
            Minimum radius in pixels, prevents stroke from getting too small when zoomed out
        radius_max_pixels : int, default 100
            Maximum radius in pixels, prevents stroke from getting too big when zoomed out
        """
        self.type = type
        self.id = id or str(uuid.uuid4())
        self._data = None
        self.data = data.to_dict(orient='records') if is_pandas_df(data) else data
        self.coverage = coverage
        self.elevation_range = elevation_range
        self.elevation_scale = elevation_scale
        self.extruded = extruded
        self.get_position = get_position
        self.opacity = opacity
        self.get_radius = get_radius or radius
        self.get_color = get_color
        self.get_fill_color = get_fill_color
        self.get_line_color = get_line_color
        self.get_line_width = get_line_width
        # ScatterplotLayer
        self.radius_scale = radius_scale
        self.stroked = stroked
        self.filled = filled
        self.radius_min_pixels = radius_min_pixels
        self.radius_max_pixels = radius_max_pixels
        self.line_width_min_pixels = line_width_min_pixels
        self.line_width_max_pixels = line_width_max_pixels
        self.line_width_units = line_width_units
        self.line_width_scale = line_width_scale
        # TextLayer
        self.size_scale = size_scale
        self.size_units = size_units
        self.size_min_pixels = size_min_pixels
        self.billboard = billboard
        self.font_family = font_family
        self.character_set = character_set
        self.font_weight = font_weight
        self.get_text = get_text
        self.get_angle = get_angle
        # PointCloudLayer
        self.coordinate_system = coordinate_system
        self.get_normal = get_normal
        self.radius_pixels = radius_pixels

        # Add any other kwargs to the JSON output
        if kwargs:
            self.__dict__.update(kwargs)

        if is_aggregate_layer(type):
            self.radius = radius
            self.upper_percentile = upper_percentile
            self.color_range = color_range
            self.light_settings = light_settings
            self.extruded = extruded if extruded is not None else True

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, data_set):
        if is_pandas_df(data_set):
            self._data = data_set.to_dict(orient='records')
        else:
            self._data = data_set
