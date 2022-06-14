import pydeck as pdk
from pydeck_carto import register_carto_layer


def test_register_carto_layer():
    assert pdk.settings.custom_libraries == []
    register_carto_layer()
    assert pdk.settings.custom_libraries == [
        {
            "libraryName": "CartoLayerLibrary",
            "resourceUri": "http://127.0.0.1:8888/dist.min.js",
        }
    ]
