import json
import pandas as pd
import numpy as np

from pydeck import Layer, Deck, Extension, settings

df = pd.DataFrame({"position": [[0, 0], [0, 0]]})


def test_constructor_binary_transport():
    test_layer = Layer(
        "ScatterplotLayer",
        data=df,
        id="test-layer",
        use_binary_transport=True,
        get_position="position",
        radius=10,
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


def test_default_layer_attributes():
    settings.default_layer_attributes = {"ScatterplotLayer": {"extra_attribute": 1, "radius": 1}}

    test_layer = Layer(
        "ScatterplotLayer",
        data=df,
        radius=10,
    )

    json_input = json.loads(Deck(test_layer).to_json())

    assert json_input["layers"][0]["@@type"] == "ScatterplotLayer"
    assert json_input["layers"][0]["extraAttribute"] == 1
    assert json_input["layers"][0]["radius"] == 10


def test_layer_with_extension():
    test_layer = Layer(
        "ScatterplotLayer",
        data=df,
        get_position="position",
        get_filter_value="value",
        filter_range=[0, 1],
        extensions=[Extension("DataFilterExtension", filter_size=1)],
    )

    layer_json = json.loads(Deck(test_layer).to_json())["layers"][0]

    # The extension config round-trips without being dropped
    assert layer_json["extensions"] == [{"@@type": "DataFilterExtension", "filterSize": 1}]
    # The props the extension adds to the layer are serialized alongside it
    assert layer_json["getFilterValue"] == "@@=value"
    assert layer_json["filterRange"] == [0, 1]


def test_extension_accessor_with_binary_transport():
    # Binary transport extracts accessor columns into binary buffers generically by
    # accessor name, so an extension accessor (getFilterValue) is transported the same
    # way as a core accessor (getPosition): both are pulled out of the JSON.
    bt_df = pd.DataFrame({"position": [[0, 0], [1, 1], [2, 2]], "value": [0.1, 0.5, 0.9]})
    test_layer = Layer(
        "ScatterplotLayer",
        bt_df,
        id="pts",
        use_binary_transport=True,
        get_position="position",
        get_filter_value="value",
        filter_range=[0, 1],
        extensions=[Extension("DataFilterExtension", filter_size=1)],
    )

    accessors = {d["accessor"] for d in test_layer.get_binary_data()}
    assert {"getPosition", "getFilterValue"} <= accessors

    layer_json = json.loads(Deck(test_layer).to_json())["layers"][0]
    # Accessor columns are moved to the binary buffer, not the JSON
    assert "getFilterValue" not in layer_json
    assert "getPosition" not in layer_json
    # Non-column extension props still serialize
    assert layer_json["extensions"] == [{"@@type": "DataFilterExtension", "filterSize": 1}]
    assert layer_json["filterRange"] == [0, 1]


def test_layer_with_extension_raw_dict():
    # The raw @@type dict form continues to serialize unchanged
    test_layer = Layer(
        "ScatterplotLayer",
        data=df,
        extensions=[{"@@type": "DataFilterExtension", "filterSize": 1}],
    )

    layer_json = json.loads(Deck(test_layer).to_json())["layers"][0]

    assert layer_json["extensions"] == [{"@@type": "DataFilterExtension", "filterSize": 1}]
