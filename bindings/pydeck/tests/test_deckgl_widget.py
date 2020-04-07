#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Uber Technologies, Inc.
# Distributed under the terms of the Modified BSD License.
import pytest

import os
from pydeck import DeckGLWidget


def test_example_creation_blank():
    w = DeckGLWidget()
    assert w.json_input == ""
