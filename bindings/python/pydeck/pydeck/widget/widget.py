#!/usr/bin/env python
# coding: utf-8

from __future__ import unicode_literals
import os
import warnings

import ipywidgets as widgets
from traitlets import Int, Unicode

from ._frontend import module_name, module_version

class DeckGLWidget(widgets.DOMWidget):
    """
    DeckGLWidget accepts JSON encoded deck.gl layers and layer properties
    and renders them based on provided view states and properties.

    You may set a Mapbox API key as an environment variable to use Mapbox maps in your visualization

    Attributes
    ----------
    mapbox_key (str) - Read on inititialization from the MAPBOX_API_KEY environment variable. Defaults to None if not set.
    json_input (str) - JSON as a string meant for reading into deck.gl JSON API
    """
    _model_name = Unicode('DeckGLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('DeckGLView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    mapbox_key = Unicode(os.getenv('MAPBOX_API_KEY'), allow_none=True).tag(sync=True)
    json_input = Unicode('').tag(sync=True)
    height = Int(500).tag(sync=True)
    width = Int(500).tag(sync=True)

    def __init__(self, suppress_warning=False):
        super(DeckGLWidget, self).__init__()
        if not os.environ.get('MAPBOX_API_KEY') and not suppress_warning:
            warnings.warn('MAPBOX_API_KEY is not set. This may impact available features of the pydeck library.', UserWarning)

