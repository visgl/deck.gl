#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Uber Technologies, Inc.
# Distributed under the terms of the Modified BSD License.
import pytest

import os
from pydeck.io.html import (
    render_json_to_html
)

from .const import FIXTURE_STRING


def test_rendering_is_not_broken():
    rendered = render_json_to_html(FIXTURE_STRING, 'fake_key')
    assert render_json_to_html
    assert FIXTURE_STRING in render_json_to_html
    assert 'fake_key' in render_json_to_html
