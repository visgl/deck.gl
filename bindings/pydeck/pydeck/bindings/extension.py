from .json_tools import JSONMixin

TYPE_IDENTIFIER = "@@type"


class Extension(JSONMixin):
    """
    Represents a deck.gl layer extension, an optional feature that can be added to
    the layers created via :class:`pydeck.bindings.layer.Layer`, e.g. data-driven
    filtering, masking, or brushing.

    Please see the deck.gl
    `extensions catalog <https://deck.gl/docs/api-reference/extensions/overview>`_
    to determine the particular parameters of your extension. Note that not all
    extensions work with all layers; each extension documents its supported layers
    and limitations, e.g.
    `DataFilterExtension <https://deck.gl/docs/api-reference/extensions/data-filter-extension#limitations>`_.

    Extension-specific options (e.g. ``filter_size`` for ``DataFilterExtension``) are
    passed here, while the accessors and props the extension adds to the layer (e.g.
    ``get_filter_value`` and ``filter_range``) are passed to the :class:`Layer`.

    Parameters
    ---------
    type : str
        deck.gl extension to apply, e.g., ``DataFilterExtension``
    **kwargs
        Any of the options passable to a deck.gl extension.

    Examples
    ========

      >>> import pydeck as pdk
      >>> layer = pdk.Layer(
      ...     "PathLayer",
      ...     data=df,
      ...     get_path="path",
      ...     get_color="color",
      ...     get_width=5,
      ...     # Props added to the layer by the extension:
      ...     get_dash_array=[8, 4],
      ...     dash_justified=True,
      ...     # The extension itself, with its own options:
      ...     extensions=[pdk.Extension("PathStyleExtension", dash=True)],
      ... )
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
