import pytest

import os

try:
    from pydeck.widget import DeckGLWidget
except ModuleNotFoundError:
    import warnings

    warnings.warn("Widget test will fail")


def test_example_creation_blank():
    w = DeckGLWidget()
    assert w.json_input == ""
