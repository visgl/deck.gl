#!/usr/bin/env python
# coding: utf-8
from __future__ import unicode_literals

from ipywidgets import register, CallbackDispatcher, DOMWidget
from traitlets import Any, Bool, Int, Unicode

from ..data_utils.binary_transfer import data_buffer_serialization
from ._frontend import module_name, module_version


@register
class DeckGLWidget(DOMWidget):
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

    def __init__(self, **kwargs):
        # In case you're curious, this code leans heavily on bqplot as a reference: https://github.com/bqplot/bqplot/blob/40fbf97b4d54acd59ed2a15f2e90c37e74dd2ec2/bqplot/marks.py
        super(DeckGLWidget, self).__init__(**kwargs)
        self._hover_handlers = CallbackDispatcher()
        # TODO implement, should replace selected_data in the Backbone model
        self._click_handlers = CallbackDispatcher()
        self._resize_handlers = CallbackDispatcher()
        self._view_state_handlers = CallbackDispatcher()
        self.on_msg(self._handle_custom_msgs)

    def on_hover(self, callback, remove=False):
        self._hover_handlers.register_callback(callback, remove=remove)

    def on_resize(self, callback, remove=False):
        self._resize_handlers.register_callback(callback, remove=remove)

    def on_view_state_change(self, callback, remove=False):
        self._view_state_handlers.register_callback(callback, remove=remove)

    def _handle_custom_msgs(self, _, content, buffers=None):
        event_type = content.get('event', '')
        if event_type == 'hover':
            self._hover_handlers(self, content)
        elif event_type == 'resize':
            self._resize_handlers(self, content)
        elif event_type == 'view-state-change':
            self._view_state_handlers(self, content)
