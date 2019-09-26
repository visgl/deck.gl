import uuid

from ..data_utils import is_pandas_df
from .json_tools import JSONMixin


class Layer(JSONMixin):
    def __init__(
        self,
        type,
        data,
        id=None,
        get_position='[lng, lat]',
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
        get_position : str, default '[lng, lat]'
            Name of position field, as a string. If the position field is given by two values,
            both as a list in a string should be provided.
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
          >>>     get_position='[lng, lat]',
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
          >>>     get_position='[lng, lat]',
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
        self.get_position = get_position

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
