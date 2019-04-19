DEFAULT_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
]


class Layer(object):
    def __init__(
        self,
        type,
        id,
        data,
        coverage=None,
        elevation_range=None,
        elevation_scale=None,
        extruded=True,
        get_position="-",
        opacity=1,
        radius=1000,
        light_settings=None,
        upper_percentile=100,
        color_range=DEFAULT_RANGE
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
