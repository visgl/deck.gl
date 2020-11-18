import numpy as np

from pydeck.data_utils.binary_transfer import serialize_columns

EXAMPLE_INPUT = [
    {
        "layer_id": "a",
        "accessor": "getPosition",
        "np_data": np.array([1, 2, 3], dtype="int64"),
        "dtype": "int64",
        "size": (3,),
    },
    {
        "layer_id": "a",
        "accessor": "getFillColor",
        "np_data": np.stack([[11, 22, 33], [44, 55, 0], [255, 20.0, 0]]),
        "dtype": "float64",
        "size": (3, 3),
    },
    {
        "layer_id": "a",
        "accessor": "getRadius",
        "np_data": np.array([0, 0, 1], dtype="uint32"),
        "dtype": "uint32",
        "size": (3,),
    },
    {
        "layer_id": "b",
        "accessor": "getPosition",
        "np_data": np.array([0, 0, 1], dtype="uint32"),
        "dtype": "uint32",
        "size": (3,),
    },
    {
        "layer_id": "b",
        "accessor": "getRadius",
        "np_data": np.stack([[11, 22, 33], [44, 55, 0], [255, 20.0, 0]]),
        "dtype": "float64",
        "size": (3, 3),
    },
]


EXPECTED_OUTPUT = {
    "a": {
        "length": 3,
        "attributes": {
            "getPosition": {"value": memoryview(np.array([1, 2, 3])), "dtype": "int64", "size": 1},
            "getFillColor": {
                "value": memoryview(np.stack([[11, 22, 33], [44, 55, 0], [255, 20.0, 0]])),
                "dtype": "float64",
                "size": 3,
            },
            "getRadius": {"value": memoryview(np.array([0, 0, 1], dtype="uint32")), "dtype": "uint32", "size": 1},
        },
    },
    "b": {
        "length": 3,
        "attributes": {
            "getPosition": {"value": memoryview(np.array([0, 0, 1], dtype="uint32")), "dtype": "uint32", "size": 1},
            "getRadius": {
                "value": memoryview(np.stack([[11, 22, 33], [44, 55, 0], [255, 20.0, 0]])),
                "dtype": "float64",
                "size": 3,
            },
        },
    },
}


def test_serialize_columns_none_input():
    assert serialize_columns(None) is None


def test_serialize_columns():
    serialized = serialize_columns(EXAMPLE_INPUT)
    # Verify that two layers are present
    assert serialized.get("a") and serialized.get("b")
    assert serialized["a"]["length"] == 3
    assert serialized["b"]["length"] == 3
    assert set(serialized.keys()) == set(EXPECTED_OUTPUT.keys()), "Different layers in output and expectation"
    assert set(serialized["a"].keys()) == set(
        EXPECTED_OUTPUT["a"].keys()
    ), "Accessors different in output and expectation for layer a"
    assert set(serialized["b"].keys()) == set(
        EXPECTED_OUTPUT["b"].keys()
    ), "Accessors different in output and expectation for layer b"

    # Verify that data buffers are correct
    for layer_key in serialized.keys():
        layer_dict = serialized[layer_key]
        for accessor_name in layer_dict["attributes"].keys():
            buf0 = np.frombuffer(
                layer_dict["attributes"][accessor_name]["value"], layer_dict["attributes"][accessor_name]["dtype"]
            )
            buf1 = np.frombuffer(
                EXPECTED_OUTPUT[layer_key]["attributes"][accessor_name]["value"],
                dtype=EXPECTED_OUTPUT[layer_key]["attributes"][accessor_name]["dtype"],
            )
            assert np.array_equal(buf0, buf1), "Binary buffer contents differ for {} in {}".format(
                accessor_name, layer_key
            )
            assert (
                layer_dict["attributes"][accessor_name]["size"]
                == EXPECTED_OUTPUT[layer_key]["attributes"][accessor_name]["size"]
            ), "Size differs for {} in {}".format(accessor_name, layer_key)
