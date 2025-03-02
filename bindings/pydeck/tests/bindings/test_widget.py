import json

from pydeck import Widget


def test_widget_constructor():
    EXPECTED = {"@@type": "ZoomWidget", "placement": "top-right"}
    assert json.loads(Widget(type="ZoomWidget", placement="top-right", view_id=None).to_json()) == EXPECTED
