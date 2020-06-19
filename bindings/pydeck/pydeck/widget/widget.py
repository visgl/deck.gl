#!/usr/bin/env python
# coding: utf-8
from __future__ import unicode_literals

import ipywidgets as widgets
from traitlets import Any, Bool, Int, Unicode

from ..data_utils.binary_transfer import data_buffer_serialization
from ._frontend import module_name, module_version


@widgets.register
class DeckGLWidget(widgets.DOMWidget):
    """
    Jupyter environment widget that takes JSON and
    renders a deck.gl visualization based on provided properties.

    You may set a Mapbox API key as an environment variable to use Mapbox maps in your visualization

    A pydeck user should be interfacing with this class only via the Deck object

    Attributes
    ----------
        json_input : str, default ''
            JSON as a string meant for reading into deck.gl JSON API
        mapbox_key : str, default ''
            API key for Mapbox map tiles
        height : int, default 500
            Height of Jupyter notebook cell, in pixels
        width : int or str, default "100%"
            Width of Jupyter notebook cell, in pixels or, if a string, a CSS width
        selected_data : list of int
            Data passed from Jupyter widget frontend back to Python backend
        tooltip : bool or dict of {str: str}, default True
            See the ``Deck`` constructor.
        js_warning : bool, default False
            Whether the string message from deck.gl should be rendered, defaults to False
        google_maps_key : str, default ''
            API key for Google Maps, used on some map layers
    """

    _model_name = Unicode("JupyterTransportModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("JupyterTransportView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    mapbox_key = Unicode("", allow_none=True).tag(sync=True)
    json_input = Unicode("").tag(sync=True)
    data_buffer = Any(default_value=None, allow_none=True).tag(sync=True, **data_buffer_serialization)
    height = Int(500).tag(sync=True)
    custom_libraries = Any(allow_none=True).tag(sync=True)
    width = Any("100%").tag(sync=True)
    selected_data = Unicode("[]").tag(sync=True)
    tooltip = Any(True).tag(sync=True)
    js_warning = Bool(False).tag(sync=True)
    google_maps_key = Unicode("", allow_none=True).tag(sync=True)
