import json

import numpy as np
import pytest

anywidget = pytest.importorskip("anywidget")

from ipywidgets.widgets.widget import _remove_buffers  # noqa: E402

from pydeck.widget import DeckGLWidget, WIDGET_BUNDLE_PATH  # noqa: E402
from pydeck.widget.widget import store_selection  # noqa: E402

BUNDLE_BUILT = WIDGET_BUNDLE_PATH.exists()

EVENT_HANDLERS = {
    "deck-hover-event": "on_hover",
    "deck-resize-event": "on_resize",
    "deck-view-state-change-event": "on_view_state_change",
    "deck-click-event": "on_click",
    "deck-drag-start-event": "on_drag_start",
    "deck-drag-event": "on_drag",
    "deck-drag-end-event": "on_drag_end",
}


@pytest.fixture
def widget(monkeypatch):
    if not BUNDLE_BUILT:
        # Without a built bundle the widget can only be constructed in dev-server mode
        monkeypatch.setenv("PYDECK_DEV_PORT", "8000")
    return DeckGLWidget()


def test_defaults(widget):
    assert widget.json_input == ""
    assert widget.data_buffer is None
    assert widget.height == 500
    assert widget.width == "100%"
    assert widget.tooltip is True
    assert widget.show_error is False
    assert widget.selected_data == []
    assert widget.handler_exception is None


@pytest.mark.skipif(not BUNDLE_BUILT, reason="Requires a built widget bundle (make copy-bundle)")
def test_esm_and_css_come_from_the_bundle():
    widget = DeckGLWidget()
    assert widget._esm.startswith(WIDGET_BUNDLE_PATH.read_text(encoding="utf-8")[:64])
    assert ".deck-widget" in widget._css


def test_dev_port_loads_bundle_from_localhost(monkeypatch):
    monkeypatch.setenv("PYDECK_DEV_PORT", "8123")
    widget = DeckGLWidget()
    assert widget._esm == "http://localhost:8123/dist/widget.js"
    assert widget._css.startswith("http://localhost:8123/")


def test_missing_bundle_raises(monkeypatch):
    if BUNDLE_BUILT:
        pytest.skip("Bundle is built; the guard only applies to source checkouts without a build")
    monkeypatch.delenv("PYDECK_DEV_PORT", raising=False)
    with pytest.raises(RuntimeError, match="widget bundle is missing"):
        DeckGLWidget()


def test_custom_messages_dispatch_to_handlers(widget):
    received = {event_type: [] for event_type in EVENT_HANDLERS}
    for event_type, register in EVENT_HANDLERS.items():
        kwargs = {"debounce_seconds": 0} if register == "on_view_state_change" else {}

        def make_handler(name):
            return lambda instance, payload: received[name].append((instance, payload))

        getattr(widget, register)(make_handler(event_type), **kwargs)

    for event_type in EVENT_HANDLERS:
        message = json.dumps({"type": event_type, "data": {"index": 1}})
        widget._handle_custom_msgs(widget, message, None)

    for event_type, calls in received.items():
        assert len(calls) == 1, event_type
        instance, payload = calls[0]
        assert instance is widget
        assert payload == {"type": event_type, "data": {"index": 1}}


def test_click_stores_and_clears_selection(widget):
    widget._handle_custom_msgs(widget, json.dumps({"type": "deck-click-event", "data": {"object": {"id": 1}}}), None)
    widget._handle_custom_msgs(widget, json.dumps({"type": "deck-click-event", "data": {"object": {"id": 2}}}), None)
    assert widget.selected_data == [{"id": 1}, {"id": 2}]
    widget._handle_custom_msgs(widget, json.dumps({"type": "deck-click-event", "data": {"picked": False}}), None)
    assert widget.selected_data == []


def test_store_selection_records_handler_exceptions(widget):
    widget.selected_data = None  # appending to None raises inside the handler
    store_selection(widget, {"data": {"object": {"id": 1}}})
    assert isinstance(widget.handler_exception, Exception)


def test_data_buffer_is_sent_as_binary_buffers(widget):
    widget.data_buffer = [
        {
            "layer_id": "layer-id",
            "column_name": "position",
            "accessor": "getPosition",
            "np_data": np.array([[0.0, 1.0], [2.0, 3.0]]),
        }
    ]
    state, buffer_paths, buffers = _remove_buffers(widget.get_state(key="data_buffer"))
    assert len(buffers) == 1
    layer_state = state["data_buffer"]["layer-id"]
    assert layer_state["length"] == 2
    attribute = layer_state["attributes"]["getPosition"]
    assert attribute["dtype"] == "float32"
    assert attribute["size"] == 2
    assert np.frombuffer(buffers[0], dtype="float32").tolist() == [0.0, 1.0, 2.0, 3.0]
