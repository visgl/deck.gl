import json

from pydeck import Widget


def test_widget_constructor():
    EXPECTED = {"@@type": "ZoomWidget", "placement": "top-right", "id": "test-widget"}
    assert json.loads(Widget(type="ZoomWidget", placement="top-right", view_id=None, id="test-widget").to_json()) == EXPECTED
