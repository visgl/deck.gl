import pandas as pd
import numpy as np

from pydeck import Layer, Deck

df = pd.DataFrame({"position": [[0, 0], [0, 0]]})


def test_constructor_binary_transport():
    test_layer = Layer(
        "ScatterplotLayer", data=df, id="test-layer", use_binary_transport=True, get_position="position", radius=10,
    )
    EXPECTED_DATUM = {
        "layer_id": "test-layer",
        "column_name": "position",
        "accessor": "getPosition",
        "np_data": np.array([[0, 0], [0, 0]]),
    }

    actual_datum = test_layer.get_binary_data()[0]

    assert test_layer.radius == 10
    assert test_layer.use_binary_transport is True
    assert test_layer.data is None
    assert len(test_layer.get_binary_data()) == 1
    assert EXPECTED_DATUM["layer_id"] == actual_datum["layer_id"]
    assert EXPECTED_DATUM["column_name"] == actual_datum["column_name"]
    assert EXPECTED_DATUM["accessor"] == actual_datum["accessor"]
    assert np.array_equal(EXPECTED_DATUM["np_data"], actual_datum["np_data"])
    assert "0, 0" not in Deck(test_layer).to_json(), "Should not write data to JSON output"
