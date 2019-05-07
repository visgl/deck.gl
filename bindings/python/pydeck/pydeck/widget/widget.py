#!/usr/bin/env python
# coding: utf-8

"""
DeckGLWidget renders JSON into a deck.gl plot
You may set a Mapbox API key as an environment variable to use Mapbox maps in your visualization
"""
from __future__ import unicode_literals
import os

import ipywidgets as widgets
from traitlets import Int, Unicode

from ._frontend import module_name, module_version


class DeckGLWidget(widgets.DOMWidget):
    _model_name = Unicode('DeckGLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('DeckGLView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    # Mapbox key, read on inititialization from the MAPBOX_API_KEY environment variable. Defaults to None if not set.
    mapbox_key = Unicode(os.getenv('MAPBOX_API_KEY')).tag(sync=True)
    # JSON as a string meant for reading into deck.gl JSON API
    json_input = Unicode('').tag(sync=True)
    height = Int(500).tag(sync=True)
    width = Int(500).tag(sync=True)
