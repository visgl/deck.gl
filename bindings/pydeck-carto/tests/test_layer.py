import json

import pydeck as pdk
from pydeck_carto import register_carto_layer, notify_error
from pydeck_carto.layer import MapType, CartoConnection


def test_register_carto_layer():
    assert pdk.settings.custom_libraries == []
    register_carto_layer()
    assert pdk.settings.custom_libraries[0]["libraryName"] == "CartoLayerLibrary"


def test_notify_error_func():
    layer = pdk.Layer(
        "CartoLayer",
        data="carto-demo-data.demo_tables.wrong_table",
        type_=MapType.TABLE,
        connection=CartoConnection.CARTO_DW,
        credentials={},
        on_data_error=notify_error(),
    )
    json_input = json.loads(layer.to_json())

    assert json_input["@@type"] == "CartoLayer"
    assert json_input["onDataError"] == {"@@function": "notifyError"}


def test_carto_configuration():
    pdk.settings.configuration = None
    register_carto_layer()
    assert "notifyError" in pdk.settings.configuration
