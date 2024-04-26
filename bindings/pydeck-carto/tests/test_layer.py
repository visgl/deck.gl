import pydeck as pdk

from pydeck_carto import register_layers


def test_register_layers():
    pdk.settings.configuration = None
    pdk.settings.default_layer_attributes = None
    pdk.settings.custom_libraries == []
    register_layers()
    assert "notifyError" in pdk.settings.configuration
    assert "VectorTileLayer" in pdk.settings.default_layer_attributes
    assert "H3TileLayer" in pdk.settings.default_layer_attributes
    assert "QuadbinTileLayer" in pdk.settings.default_layer_attributes
    assert "RasterTileLayer" in pdk.settings.default_layer_attributes
    assert pdk.settings.custom_libraries[0]["libraryName"] == "CartoLibrary"
