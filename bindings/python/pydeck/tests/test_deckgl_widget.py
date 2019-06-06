#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Uber Technologies, Inc.
# Distributed under the terms of the Modified BSD License.
import pytest

import os
from pydeck import DeckGLWidget


def test_example_creation_blank():
    w = DeckGLWidget()
    assert w.json_input == ''


def test_warning():
    _environ = dict(os.environ)
    try:
        if os.environ.get('MAPBOX_API_KEY'):
            del os.environ['MAPBOX_API_KEY']
        with pytest.warns(UserWarning) as record:
            w = DeckGLWidget()
            os.environ['MAPBOX_API_KEY'] = 'pk.xx'
            w = DeckGLWidget()
        # Assert that only one warning has been raised
        assert len(record) == 1
    finally:
        os.environ.clear()
        os.environ.update(_environ)
