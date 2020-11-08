from exceptions import PydeckException


class Providers:
    """Basemap providers available in pydeck"""

    MAPBOX = "mapbox"
    GOOGLE_MAPS = "google_maps"
    CARTO = "carto"

    @classmethod
    def as_list(cls):
        return [a for a in dir(cls) if not a.startswith("__") and not callable(getattr(cls, a))]

    @classmethod
    def in_list_or_raise(cls, value):
        if value not in cls.as_list():
            raise PydeckException(
                f"{value} is not a recognized API key provider. Choose one of the following: {cls.as_list()}"
            )
