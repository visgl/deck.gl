from .json_tools import JSONMixin

TYPE_IDENTIFIER = "@@type"


class Effect(JSONMixin):
    """Represents a deck.gl effect or an object used to configure an effect.

    Parameters
    ----------
    type : str
        Registered deck.gl class name, for example ``LightingEffect`` or
        ``AmbientLight``.
    **kwargs
        Properties passed to the JavaScript class constructor.
    """

    def __init__(self, type, **kwargs):
        self.type = type
        self.__dict__.update(kwargs)

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
