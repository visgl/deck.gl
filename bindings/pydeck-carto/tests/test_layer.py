import json
import pydeck as pdk

from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, get_error_notifier
from pydeck_carto.layer import MapType, CartoConnection


def test_register_carto_layer():
    assert pdk.settings.custom_libraries == []
    register_carto_layer()
    assert pdk.settings.custom_libraries[0]["libraryName"] == "CartoLayerLibrary"


def test_get_layer_credentials():
    carto_auth_mock = CartoAuth(
        api_base_url="https://api.carto.com", access_token="1234567890", expires_in=1
    )
    assert get_layer_credentials(carto_auth_mock) == {
        "apiVersion": "v3",
        "apiBaseUrl": "https://api.carto.com",
        "accessToken": "1234567890",
    }


def test_get_error_notifier_func():
    layer = pdk.Layer(
        "CartoLayer",
        data="carto-demo-data.demo_tables.wrong_table",
        type_=MapType.TABLE,
        connection=CartoConnection.CARTO_DW,
        credentials={},
        on_data_error=get_error_notifier(),
    )
    json_input = json.loads(layer.to_json())

    assert json_input["@@type"] == "CartoLayer"
    assert json_input["onDataError"] == {"@@function": "notifyError"}


def test_carto_configuration():
    pdk.settings.configuration = None
    register_carto_layer()
    assert "notifyError" in pdk.settings.configuration
