import json
import pydeck as pdk

from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials
from pydeck_carto.layer import MapType, CartoConnection


def test_register_carto_layer():
    pdk.settings.configuration = None
    pdk.settings.default_layer_attributes = None
    pdk.settings.custom_libraries == []
    register_carto_layer()
    assert "notifyError" in pdk.settings.configuration
    assert "CartoLayer" in pdk.settings.default_layer_attributes
    assert pdk.settings.custom_libraries[0]["libraryName"] == "CartoLayerLibrary"


def test_get_layer_credentials():
    carto_auth = CartoAuth(
        mode="oauth",
        api_base_url="https://api.carto.com",
        access_token="1234567890",
        expiration=10000000000,
    )
    assert get_layer_credentials(carto_auth) == {
        "apiVersion": "v3",
        "apiBaseUrl": "https://api.carto.com",
        "accessToken": "1234567890",
    }


def test_carto_layer_json():
    layer = pdk.Layer(
        "CartoLayer",
        data="carto-demo-data.demo_tables.wrong_table",
        type_=MapType.TABLE,
        connection=CartoConnection.CARTO_DW,
        credentials={},
    )
    json_input = json.loads(layer.to_json())

    assert json_input["@@type"] == "CartoLayer"
    assert json_input["data"] == "carto-demo-data.demo_tables.wrong_table"
    assert json_input["type"] == "table"
    assert json_input["connection"] == "carto_dw"
    assert json_input["credentials"] == {}
    # Default attributes
    assert json_input["clientId"] == "pydeck-carto"
    assert json_input["onDataError"] == {"@@function": "notifyError"}
