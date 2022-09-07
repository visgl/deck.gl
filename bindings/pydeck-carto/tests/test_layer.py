import pydeck as pdk
from pydeck_carto import register_carto_layer


def test_register_carto_layer():
    assert pdk.settings.custom_libraries == []
    register_carto_layer()
    assert pdk.settings.custom_libraries[0]["libraryName"] == "CartoLayerLibrary"
