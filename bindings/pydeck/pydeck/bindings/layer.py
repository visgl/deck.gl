import uuid

from ..data_utils import is_pandas_df
from .json_tools import JSONMixin


TYPE_IDENTIFIER = '@@type'
FUNCTION_IDENTIFIER = '@@='
QUOTE_CHARS = {"'", '"', "`"}


class Layer(JSONMixin):
    def __init__(
        self,
        type,
        data,
        id=None,
        **kwargs
    ):
        """Configures a deck.gl layer for rendering on a map. Parameters passed
        here will be specific to the particular deck.gl layer that you are choosing to use.

        Please see the deck.gl
        `Layer catalog <https://deck.gl/#/documentation/deckgl-api-reference/layers/overview>`_
        to determine the particular parameters of your layer. You are highly encouraged to look
        at the examples in the pydeck documentation.

        Parameters
        ==========

        type : str
            Type of layer to render, e.g., `HexagonLayer`
        id : str
            Unique name for layer
        data : str or list of dict of {str: Any} or pandas.DataFrame
            Either a URL of data to load in or an array of data
        **kwargs
            Any of the parameters passable to a deck.gl layer.

        Examples
        ========

        For example, here is a HexagonLayer which reads data from a URL.

          >>> import pydeck
          >>> # 2014 location of car accidents in the UK
          >>> UK_ACCIDENTS_DATA = ('https://raw.githubusercontent.com/uber-common/'
          >>>                     'deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')
          >>> # Define a layer to display on a map
          >>> layer = pydeck.Layer(
          >>>     'HexagonLayer',
          >>>     UK_ACCIDENTS_DATA,
          >>>     get_position=['lng', 'lat'],
          >>>     auto_highlight=True,
          >>>     elevation_scale=50,
          >>>     pickable=True,
          >>>     elevation_range=[0, 3000],
          >>>     extruded=True,
          >>>     coverage=1)

        Alternately, input can be a pandas.DataFrame:

          >>> import pydeck
          >>> df = pd.read_csv(UK_ACCIDENTS_DATA)
          >>> layer = pydeck.Layer(
          >>>     'HexagonLayer',
          >>>     df,
          >>>     get_position=['lng', 'lat'],
          >>>     auto_highlight=True,
          >>>     elevation_scale=50,
          >>>     pickable=True,
          >>>     elevation_range=[0, 3000],
          >>>     extruded=True,
          >>>     coverage=1)
        """
        self.type = type
        self.id = id or str(uuid.uuid4())
        self._data = None
        self.data = data.to_dict(orient='records') if is_pandas_df(data) else data

        # Add any other kwargs to the JSON output
        if kwargs:
            for k, v in kwargs.items():
                # We assume strings and arrays of strings are identifiers
                # ["lng", "lat"] would be converted to '[lng, lat]'
                # TODO given that data here is usually a list of records,
                # we could probably check that the identifier is in the row
                # Errors on case like get_position='-', however

                if isinstance(v, str) and v[0] in QUOTE_CHARS and v[0] == v[-1]:
                    # Skip quoted strings
                    kwargs[k] = v.replace(v[0], '')
                elif isinstance(v, str):
                    # Have @deck.gl/json treat strings values as functions
                    kwargs[k] = FUNCTION_IDENTIFIER + v

                elif isinstance(v, list) and v != [] and isinstance(v[0], str):
                    # Allows the user to pass lists e.g. to specify coordinates
                    array_as_str = ''
                    for i, identifier in enumerate(v):
                        if i == len(v) - 1:
                            array_as_str += '{}'.format(identifier)
                        else:
                            array_as_str += '{}, '.format(identifier)
                    kwargs[k] = '{}[{}]'.format(FUNCTION_IDENTIFIER, array_as_str)

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

    @property
    def type(self):
        return getattr(self, TYPE_IDENTIFIER)

    @type.setter
    def type(self, type_name):
        self.__setattr__(TYPE_IDENTIFIER, type_name)
