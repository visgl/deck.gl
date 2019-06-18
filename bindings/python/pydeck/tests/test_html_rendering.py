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


def test_example_creation_blank():
    rendered = render_json_to_html(FIXTURE_STRING, 'fake_key')
    # f = open('tmp.html', 'w').write(rendered)
    # f.close()
    assert render_json_to_html
