import os

from .json_tools import JSONMixin
from .layer import Layer
from ..io.html import deck_to_html
from ..settings import settings as pydeck_settings
from ..widget import DeckGLWidget
from .view import View
from .view_state import ViewState
from .base_map_provider import BaseMapProvider
from .map_styles import DARK, get_from_map_identifier


class Deck(JSONMixin):
    def __init__(
        self,
        layers=None,
        views=[View(type="MapView", controller=True)],
        map_style=DARK,
        api_keys=None,
        initial_view_state=ViewState(latitude=0, longitude=0, zoom=1),
        width="100%",
        height=500,
        tooltip=True,
        description=None,
        effects=None,
        map_provider=BaseMapProvider.CARTO.value,
        parameters=None,
    ):
        """This is the renderer and configuration for a deck.gl visualization, similar to the
        `Deck <https://deck.gl/#/documentation/deckgl-api-reference/deck>`_ class from deck.gl.
        Pass `Deck` a Mapbox API token to display a basemap; see the notes below.

        Parameters
        ----------

        layers : pydeck.Layer or list of pydeck.Layer, default None
            List of :class:`pydeck.bindings.layer.Layer` layers to render.
        views : list of pydeck.View, default ``[pydeck.View(type="MapView", controller=True)]``
            List of :class:`pydeck.bindings.view.View` objects to render.
        api_keys : dict, default None
            Dictionary of geospatial API service providers, where the keys are ``mapbox``, ``google_maps``, or ``carto``
            and the values are the API key. Defaults to None if not set. Any of the environment variables
            ``MAPBOX_API_KEY``, ``GOOGLE_MAPS_API_KEY``, and ``CARTO_API_KEY`` can be set instead of hardcoding the key here.
        map_provider : str, default 'carto'
            If multiple API keys are set (e.g., both Mapbox and Google Maps), inform pydeck which basemap provider to prefer.
            Values can be ``carto``, ``mapbox`` or ``google_maps``
        map_style : str, default 'dark'
            One of 'light', 'dark', 'road', 'satellite', 'dark_no_labels', and 'light_no_labels', or
            URI for basemap style, which varies by provider. The default is Carto's Dark Matter map.
            For Mapbox examples, see  Mapbox's `gallery <https://www.mapbox.com/gallery/>`_.
            If not using a basemap, set ``map_provider=None``.
        initial_view_state : pydeck.ViewState, default ``pydeck.ViewState(latitude=0, longitude=0, zoom=1)``
            Initial camera angle relative to the map, defaults to a fully zoomed out 0, 0-centered map
            To compute a viewport from data, see :func:`pydeck.data_utils.viewport_helpers.compute_view`
        height : int, default 500
            Height of Jupyter notebook cell, in pixels.
        width : int` or string, default '100%'
            Width of visualization, in pixels (if a number) or as a CSS value string.
        tooltip : bool or dict of {str: str}, default True
            If ``True``/``False``, toggles a default tooltip on visualization hover.
            Layers must have ``pickable=True`` set in order to display a tooltip.
            For more advanced usage, the user can pass a dict to configure more custom tooltip features.
            Further documentation is `here <tooltip.html>`_.

        .. _Deck:
            https://deck.gl/#/documentation/deckgl-api-reference/deck
        .. _gallery:
            https://www.mapbox.com/gallery/
        """
        self.layers = []
        if isinstance(layers, Layer):
            self.layers.append(layers)
        else:
            self.layers = layers or []
        self.views = views
        # Use passed view state
        self.initial_view_state = initial_view_state
        self.deck_widget = DeckGLWidget()
        self.deck_widget.custom_libraries = pydeck_settings.custom_libraries
        api_keys = api_keys or {}
        self._set_api_keys(api_keys)

        self.deck_widget.height = height
        self.deck_widget.width = width
        self.deck_widget.tooltip = tooltip

        self.description = description
        self.effects = effects

        self.map_provider = str(map_provider).lower() if map_provider else None
        self.deck_widget.map_provider = map_provider

        self.map_style = get_from_map_identifier(map_style, map_provider)

        self.parameters = parameters

    @property
    def selected_data(self):
        if not self.deck_widget.selected_data:
            return None
        return self.deck_widget.selected_data

    def _set_api_keys(self, api_keys: dict = None):
        """Sets API key for base map provider for both HTML embedding and the Jupyter widget"""
        for k in api_keys:
            k and BaseMapProvider(k)
        for provider in BaseMapProvider:
            attr_name = f"{provider.value}_key"
            provider_env_var = f"{provider.name}_API_KEY"
            attr_value = api_keys.get(provider.value) or os.getenv(provider_env_var)
            setattr(self, attr_name, attr_value)
            setattr(self.deck_widget, attr_name, attr_value)

    def show(self):
        """Display current Deck object for a Jupyter notebook"""
        self.update()
        return self.deck_widget

    def update(self):
        """Update a deck.gl map to reflect the current configuration

        For example, if you've modified data passed to Layer and rendered the map using `.show()`,
        you can call `update` to change the data on the map.

        Intended for use in a Jupyter environment.
        """
        self.deck_widget.json_input = self.to_json()
        has_binary = False
        binary_data_sets = []
        for layer in self.layers:
            if layer.use_binary_transport:
                binary_data_sets.extend(layer.get_binary_data())
                has_binary = True
        if has_binary:
            self.deck_widget.data_buffer = binary_data_sets

    def to_html(
        self,
        filename=None,
        open_browser=False,
        notebook_display=None,
        iframe_width="100%",
        iframe_height=500,
        as_string=False,
        offline=False,
        **kwargs,
    ):
        """Write a file and loads it to an iframe, if in a Jupyter environment;
        otherwise, write a file and optionally open it in a web browser

        Parameters
        ----------
        filename : str, default None
            Name of the file.
        open_browser : bool, default False
            Whether a browser window will open or not after write.
        notebook_display : bool, default None
            Display the HTML output in an iframe if True. Set to True automatically if rendering in Jupyter.
        iframe_width : str or int, default '100%'
            Width of Jupyter notebook iframe in pixels, if rendered in a Jupyter environment.
        iframe_height : int, default 500
            Height of Jupyter notebook iframe in pixels, if rendered in Jupyter or Colab.
        as_string : bool, default False
            Returns HTML as a string, if True and ``filename`` is None.
        css_background_color : str, default None
            Background color for visualization, specified as a string in any format accepted for CSS colors.

        Returns
        -------
        str
            Returns absolute path of the file
        """
        deck_json = self.to_json()
        f = deck_to_html(
            deck_json,
            mapbox_key=self.mapbox_key,
            google_maps_key=self.google_maps_key,
            filename=filename,
            open_browser=open_browser,
            notebook_display=notebook_display,
            iframe_height=iframe_height,
            iframe_width=iframe_width,
            tooltip=self.deck_widget.tooltip,
            custom_libraries=pydeck_settings.custom_libraries,
            as_string=as_string,
            offline=offline,
            **kwargs,
        )
        return f
