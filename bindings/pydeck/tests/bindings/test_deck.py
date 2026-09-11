import pytest

import json
import sys

import pydeck
from pydeck.bindings.deck import has_jupyter_extra

try:
    from unittest.mock import MagicMock
except ImportError:
    from mock import MagicMock

from pydeck import Deck
from pydeck import map_styles
from pydeck.bindings.base_map_provider import BaseMapProvider
from IPython.display import HTML

from . import pydeck_examples
from ..fixtures import fixtures


def test_deck_layer_args():
    """Verify layer argument null cases"""
    CASES = [({"layers": None}, []), ({"layers": []}, [])]
    for [args, expected_output] in CASES:
        r = Deck(**args)
        assert r.layers == expected_output


@pytest.mark.parametrize(
    "map_provider_enum, expected_map_style",
    (
        (BaseMapProvider.CARTO, map_styles.CARTO_DARK),
        (BaseMapProvider.MAPBOX, map_styles.MAPBOX_DARK),
        (BaseMapProvider.GOOGLE_MAPS, map_styles.GOOGLE_ROAD),
    ),
    ids=[BaseMapProvider.CARTO, BaseMapProvider.MAPBOX, BaseMapProvider.GOOGLE_MAPS],
)
def test_deck_default_map_style(map_provider_enum: BaseMapProvider, expected_map_style: str):
    """Verify that a default map style is provided for all map providers."""
    r = Deck(**{"layers": [], "map_provider": map_provider_enum.value})
    assert r.map_provider == map_provider_enum.value
    assert r.map_style == expected_map_style


def test_json_output():
    """Verify that the JSON rendering produces an @deck.gl/json library-compliant JSON object

    Screen capture tests that correspond to the JSON output here is in `/test/render/jupyter-widget.js`
    in the root of the deck.gl repo.
    """
    TEST_CASES = [
        (pydeck_examples.create_local_image_test_object(), fixtures["local-image"], "local-image"),
        (pydeck_examples.create_minimal_test_object(), fixtures["minimal"], "minimal"),
        (pydeck_examples.create_heatmap_test_object(), fixtures["heatmap-layer-function"], "heatmap-layer-function"),
        (pydeck_examples.create_geojson_layer_test_object(), fixtures["geojson-layer"], "geojson-layer"),
        (pydeck_examples.create_multi_layer_test_object(), fixtures["multilayers"], "multilayers"),
        (pydeck_examples.create_scatterplot_test_object(), fixtures["scatterplot"], "scatterplot"),
        (pydeck_examples.create_stacked_test_object(), fixtures["stacked"], "stacked"),
    ]
    for t in TEST_CASES:
        actual, expected = t[0], t[1]
        assert json.loads(str(actual.to_json())) == json.loads(expected)


requires_jupyter_extra = pytest.mark.skipif(
    not has_jupyter_extra(), reason="Requires the Jupyter extra and a built widget bundle (make copy-bundle)"
)


@requires_jupyter_extra
def test_update():
    """Verify that calling `update` pushes the current configuration to the widget"""
    deck = pydeck_examples.create_minimal_test_object()
    deck.initial_view_state.latitude, deck.initial_view_state.longitude = 0, 0
    deck.update()
    # Create relevant results string
    expected_results = json.loads(fixtures["minimal"])
    expected_results["initialViewState"]["latitude"] = 0
    expected_results["initialViewState"]["longitude"] = 0
    assert json.loads(str(deck)) == expected_results
    assert deck.deck_widget.json_input == deck.to_json()
    assert deck.deck_widget.data_buffer is None


@requires_jupyter_extra
def test_update_with_binary_transport():
    import pandas as pd

    df = pd.DataFrame({"position": [[0.0, 0.0], [1.0, 1.0]]})
    layer = pydeck.Layer("ScatterplotLayer", id="points", data=df, get_position="position", use_binary_transport=True)
    deck = pydeck.Deck(layers=[layer])
    deck.update()
    assert "data" not in json.loads(deck.deck_widget.json_input)["layers"][0]
    assert deck.deck_widget.data_buffer[0]["layer_id"] == "points"


@requires_jupyter_extra
def test_show_jupyter():
    pydeck.io.html.render_for_colab = MagicMock()
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.show()
    pydeck.io.html.render_for_colab.assert_not_called()
    assert isinstance(output, pydeck.widget.DeckGLWidget)
    assert output.json_input == deck.to_json()


def test_show_google_colab():
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_google_colab = True
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.show()
    pydeck.io.html.in_google_colab = False
    if has_jupyter_extra():
        # anywidget enables Colab's custom widget manager itself, so the widget renders directly
        assert isinstance(output, pydeck.widget.DeckGLWidget)
        pydeck.io.html.render_for_colab.assert_not_called()
    else:
        pydeck.io.html.render_for_colab.assert_called_once()
        assert output is None


def test_show_and_update_without_jupyter_extra(monkeypatch):
    monkeypatch.setitem(sys.modules, "anywidget", None)
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.in_google_colab = False
    deck = pydeck_examples.create_minimal_test_object()
    assert not hasattr(deck, "deck_widget")
    assert deck.selected_data is None
    assert isinstance(deck.show(), HTML)
    with pytest.raises(ImportError):
        deck.update()


def test_to_html_jupyter():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_jupyter = MagicMock(return_value=True)
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.to_html()
    pydeck.io.html.iframe_with_srcdoc.assert_called_once()
    pydeck.io.html.render_for_colab.assert_not_called()
    assert isinstance(output, HTML)
    assert output.data == "Hello"


def test_to_html_google_colab():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_google_colab = True
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.to_html()
    pydeck.io.html.in_google_colab = False
    pydeck.io.html.iframe_with_srcdoc.assert_not_called()
    pydeck.io.html.render_for_colab.assert_called_once()
    assert output is None


def test_repr_html_jupyter():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_jupyter = MagicMock(return_value=True)
    deck = pydeck_examples.create_minimal_test_object()
    output = deck._repr_html_()
    pydeck.io.html.iframe_with_srcdoc.assert_called_once()
    pydeck.io.html.render_for_colab.assert_not_called()
    assert output == "Hello"


def test_repr_html_google_colab():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_google_colab = True
    deck = pydeck_examples.create_minimal_test_object()
    output = deck._repr_html_()
    pydeck.io.html.in_google_colab = False
    pydeck.io.html.iframe_with_srcdoc.assert_not_called()
    pydeck.io.html.render_for_colab.assert_called_once()
    assert output == ""
