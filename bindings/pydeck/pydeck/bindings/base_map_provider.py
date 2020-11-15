from enum import Enum

from pydeck.exceptions import PydeckException


class BaseMapProvider(Enum):
    """Basemap provider available in pydeck"""

    MAPBOX = "mapbox"
    GOOGLE_MAPS = "google_maps"
    CARTO = "carto"

    @classmethod
    def as_list(cls):
        return [x.value for x in cls]

    @classmethod
    def in_list_or_raise(cls, value):
        if value not in cls.as_list():
            raise PydeckException(
                f"{value} is not a recognized API key provider. Choose one of the following: {cls.as_list()}"
            )
