#!/usr/bin/env python
# coding: utf-8

"""
DeckGLWidget renders JSON into a deck.gl plot

It requires a mapbox API key to be set as an environment variable
"""
from __future__ import unicode_literals
import os

import ipywidgets as widgets
from traitlets import Unicode

from ._frontend import module_name, module_version


class DeckGLWidget(widgets.DOMWidget):
    _model_name = Unicode('DeckGLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('DeckGLView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
    mapbox_key = Unicode(os.getenv('MAPBOX_API_KEY')).tag(sync=True)
    json_input = Unicode('').tag(sync=True)
