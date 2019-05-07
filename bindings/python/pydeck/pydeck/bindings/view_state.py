from .json_tools import JSONMixin

class ViewState(JSONMixin):
    def __init__(
        self,
        longitude=0.0,
        latitude=0.0,
        zoom=10,
        min_zoom=1,
        max_zoom=20,
        pitch=0,
        bearing=0
    ):
        self.longitude = longitude
        self.latitude = latitude
        self.zoom = zoom
        self.min_zoom = min_zoom
        self.max_zoom = max_zoom
        self.pitch = pitch
        self.bearing = bearing
