import pytest

import json
import os

from ..fixtures import fixtures

from . import pydeck_examples

from pydeck import Deck


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
