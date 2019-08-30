#!/usr/bin/env python
# coding: utf-8

from __future__ import unicode_literals

import ipywidgets as widgets
from traitlets import Int, Any, Unicode

from ._frontend import module_name, module_version

class DeckGLWidget(widgets.DOMWidget):
    """
    DeckGLWidget accepts JSON encoded deck.gl layers and layer properties
    and renders them based on provided view states and properties.

    You may set a Mapbox API key as an environment variable to use Mapbox maps in your visualization

    Attributes
    ----------
    json_input : str
        JSON as a string meant for reading into deck.gl JSON API
    mapbox_key : str
        API key for Mapbox map tiles
    height : int
        Height of Jupyter notebook cell, in pixels
    width : int
        Width of Jupyter notebook cell, in pixels
    selected_data : :obj:`list` of :obj:`int`
        Data passed from Jupyter widget frontend back to Python backend
    """
    _model_name = Unicode('DeckGLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('DeckGLView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    mapbox_key = Unicode('', allow_none=True).tag(sync=True)
    json_input = Unicode('').tag(sync=True)
    height = Int(500).tag(sync=True)
    width = Int(500).tag(sync=True)
    selected_data = Any().tag(sync=True)
