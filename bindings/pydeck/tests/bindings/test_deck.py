import json
import pydeck

try:
    from unittest.mock import MagicMock
except ImportError:
    from mock import MagicMock

from pydeck import Deck
from IPython.display import HTML

from . import pydeck_examples
from ..fixtures import fixtures


def test_deck_layer_args():
    """Verify layer argument null cases"""
    CASES = [({"layers": None}, []), ({"layers": []}, [])]
    for [args, expected_output] in CASES:
        r = Deck(**args)
        assert r.layers == expected_output


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


def test_update():
    """Verify that calling `update` changes the Deck object"""
    deck = pydeck_examples.create_minimal_test_object()
    deck.initial_view_state.latitude, deck.initial_view_state.longitude = 0, 0
    deck.update()
    # Create relevant results string
    expected_results = json.loads(fixtures["minimal"])
    expected_results["initialViewState"]["latitude"] = 0
    expected_results["initialViewState"]["longitude"] = 0
    assert json.loads(str(deck)) == expected_results


def test_show_jupyter():
    pydeck.io.html.render_for_colab = MagicMock()
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.show()
    pydeck.io.html.render_for_colab.assert_not_called()
    assert isinstance(output, pydeck.widget.DeckGLWidget)


def test_show_google_colab():
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_google_colab = True
    pydeck.bindings.deck.in_google_colab = True
    deck = pydeck_examples.create_minimal_test_object()
    output = deck.show()
    pydeck.bindings.deck.in_google_colab = False
    pydeck.io.html.in_google_colab = False
    pydeck.io.html.render_for_colab.assert_called_once()
    assert output is None


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
