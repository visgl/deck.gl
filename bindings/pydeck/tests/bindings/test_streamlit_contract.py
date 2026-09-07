"""Streamlit's st.pydeck_chart consumes pydeck programmatically (Deck.to_json() plus a few attributes) and
never loads pydeck's frontend. These tests pin that contract so the Jupyter widget can evolve freely."""

import json
import sys

import pandas as pd
import pytest

import pydeck
from pydeck.bindings.deck import has_jupyter_extra

# Every instance attribute a Deck may carry. Anything new must either be added here deliberately or be
# stripped from to_json() through pydeck.bindings.json_tools.IGNORE_KEYS.
KNOWN_DECK_ATTRIBUTES = {
    "layers",
    "views",
    "widgets",
    "initial_view_state",
    "description",
    "effects",
    "map_provider",
    "map_projection",
    "map_style",
    "parameters",
    "_tooltip",
    "_show_error",
    "deck_widget",
    "mapbox_key",
    "google_maps_key",
    "carto_key",
    "maplibre_key",
}


def make_deck():
    layer = pydeck.Layer("ScatterplotLayer", id="points", data=[{"position": [0, 0]}], get_position="position")
    return pydeck.Deck(
        layers=[layer],
        initial_view_state=pydeck.ViewState(latitude=0, longitude=0, zoom=1),
        tooltip={"text": "{position}"},
    )


@pytest.fixture
def without_jupyter_extra(monkeypatch):
    monkeypatch.setitem(sys.modules, "anywidget", None)
    assert not has_jupyter_extra()


def test_to_json_is_identical_with_and_without_the_jupyter_extra(monkeypatch):
    with_extra = json.loads(make_deck().to_json())
    monkeypatch.setitem(sys.modules, "anywidget", None)
    without_extra = json.loads(make_deck().to_json())
    assert with_extra == without_extra


def test_attributes_streamlit_reads():
    deck = make_deck()
    # Deck.mapbox_key, read via getattr
    assert deck.mapbox_key is None or isinstance(deck.mapbox_key, str)
    # Tooltip: deck_widget.tooltip when the extra is installed, _tooltip otherwise
    widget_tooltip = getattr(getattr(deck, "deck_widget", None), "tooltip", None)
    assert deck._tooltip == {"text": "{position}"}
    if has_jupyter_extra():
        assert widget_tooltip == {"text": "{position}"}
    else:
        assert not hasattr(deck, "deck_widget")


def test_layer_data_is_writable_with_a_dataframe():
    deck = make_deck()
    deck.layers[0].data = pd.DataFrame({"position": [[1, 2]]})
    assert json.loads(deck.to_json())["layers"][0]["data"] == [{"position": [1, 2]}]


def test_deck_has_no_unknown_attributes():
    assert set(vars(make_deck())) <= KNOWN_DECK_ATTRIBUTES


def test_deck_has_no_unknown_attributes_without_extra(without_jupyter_extra):
    attributes = set(vars(make_deck()))
    assert attributes <= KNOWN_DECK_ATTRIBUTES
    assert "deck_widget" not in attributes
