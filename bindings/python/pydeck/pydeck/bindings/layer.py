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
        get_position='[lng, lat]',
        **kwargs
    ):
        """Configures a deck.gl layer for rendering on a map

        Each field here is specific to the particular deck.gl layer you're choosing to use.

        Please see the deck.gl `Layer documentation`_.

        You are highly encouraged to look at the examples page: :ref:`pydeck Layer Overview and Examples`

        Parameters
        ---------
        type : str
            Type of layer to render, e.g., `HexagonLayer`
        id : str
            Unique name for layer
        data : str or list of dict of {str: Any}
            Either a URL of data to load in or an array of data
        get_position : str, default '[lng, lat]'
            Name of position field, as a string. Note that this uses the deck.gl expression parser
            and that examples
        **kwargs : Any
            These parameters will be converted to camelCase from snake_case

        :: _`Layer documentation`
            https://deck.gl/#/documentation/deckgl-api-reference/layers/overview
        """
        self.type = type
        self.id = id or str(uuid.uuid4())
        self._data = None
        self.data = data.to_dict(orient='records') if is_pandas_df(data) else data

        # Add any other kwargs to the JSON output
        if kwargs:
            self.__dict__.update(kwargs)

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, data_set):
        """Make the data attribute a list no matter the input type"""
        if is_pandas_df(data_set):
            self._data = data_set.to_dict(orient='records')
        else:
            self._data = data_set
