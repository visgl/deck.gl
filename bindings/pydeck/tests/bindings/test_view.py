import json

from pydeck import View


def test_view_constructor():
    EXPECTED = '{"@@type": "MapView", "controller": false, "repeat": true}'
    assert View(type="MapView", controller=False, repeat=True).to_json() == EXPECTED
