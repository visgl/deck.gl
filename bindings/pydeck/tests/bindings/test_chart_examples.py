import glob
import json
import os
import runpy

import pytest

import pydeck

EXAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "examples"))
CHART_EXAMPLES = sorted(glob.glob(os.path.join(EXAMPLES_DIR, "charts", "*.py")))
NON_GEOSPATIAL_VIEWS = {"OrthographicView", "OrbitView"}


def test_chart_examples_exist():
    assert len(CHART_EXAMPLES) >= 3


@pytest.mark.parametrize("path", CHART_EXAMPLES, ids=os.path.basename)
def test_chart_example_is_non_geospatial(path, monkeypatch, tmp_path):
    """Chart examples run offline, use a non-geospatial view and camera, and never draw a basemap"""
    captured = []
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(pydeck.Deck, "to_html", lambda self, *args, **kwargs: captured.append(self))
    runpy.run_path(path, run_name="__main__")

    assert len(captured) == 1
    deck = captured[0]
    assert deck.map_provider is None
    assert deck.views and all(view.type in NON_GEOSPATIAL_VIEWS for view in deck.views)

    payload = json.loads(deck.to_json())
    assert payload["layers"]
    view_state = payload["initialViewState"]
    assert "target" in view_state
    assert "latitude" not in view_state and "longitude" not in view_state
