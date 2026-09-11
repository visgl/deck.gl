import json

from pydeck import ViewState


def test_non_geospatial_view_state_kwargs_are_camel_cased():
    view_state = ViewState(target=[0, 0, 0], zoom=2, rotation_x=30, rotation_orbit=-20, min_zoom=1)
    assert json.loads(view_state.to_json()) == {
        "target": [0, 0, 0],
        "zoom": 2,
        "rotationX": 30,
        "rotationOrbit": -20,
        "minZoom": 1,
    }


def test_geospatial_defaults_are_omitted_when_unset():
    payload = json.loads(ViewState(target=[1, 2, 0], zoom=3).to_json())
    assert "latitude" not in payload and "longitude" not in payload
