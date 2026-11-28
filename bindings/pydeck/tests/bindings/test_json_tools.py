import json

import numpy as np

from pydeck import Layer, ViewState
from pydeck.bindings.json_tools import serialize


def test_serialize_numpy_scalars():
    actual = json.loads(
        serialize(
            {
                "int": np.int64(2),
                "float": np.float32(0.5),
                "bool": np.bool_(True),
            }
        )
    )
    assert actual == {"int": 2, "float": 0.5, "bool": True}
    assert isinstance(actual["int"], int)
    assert isinstance(actual["bool"], bool)


def test_serialize_numpy_arrays():
    actual = json.loads(serialize({"path": np.array([[0, 0], [1.5, 1]]), "color": np.array([255, 0, 0])}))
    assert actual == {"path": [[0, 0], [1.5, 1]], "color": [255, 0, 0]}


def test_layer_with_numpy_values():
    layer = Layer(
        "PathLayer",
        id="numpy-layer",
        data=[{"path": np.array([[0, 0], [1, 1]])}],
        get_path="path",
        get_color=np.array([255, 0, 0]),
        width_min_pixels=np.int64(2),
        pickable=np.bool_(True),
    )
    actual = json.loads(layer.to_json())
    assert actual["data"] == [{"path": [[0, 0], [1, 1]]}]
    assert actual["getColor"] == [255, 0, 0]
    assert actual["widthMinPixels"] == 2
    assert actual["pickable"] is True


def test_view_state_with_numpy_values():
    actual = json.loads(ViewState(latitude=np.float32(-6.25), longitude=106.75, zoom=np.int64(10)).to_json())
    assert actual == {"latitude": -6.25, "longitude": 106.75, "zoom": 10}
