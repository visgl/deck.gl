import json

from pydeck import View


def test_view_constructor():
    EXPECTED = {"@@type": "MapView", "controller": False, "repeat": True}
    assert json.loads(View(type="MapView", controller=False, repeat=True).to_json()) == EXPECTED
