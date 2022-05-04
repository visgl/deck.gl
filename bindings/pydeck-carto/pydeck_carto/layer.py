import pydeck as pdk

CARTO_LAYER_BUNDLE_URL = "https://libs.cartocdn.com/pydeck/@deck.gl/carto@8.7.8/dist.min.js"


def register_carto_layer():
    """Add CartoLayer JS bundle to pydeck"s custom libraries"""
    library_name = "CartoLayerLibrary"
    custom_library = {
        "libraryName": library_name,
        "resourceUri": CARTO_LAYER_BUNDLE_URL,
    }

    if pdk.settings.custom_libraries is None:
        pdk.settings.custom_libraries = [custom_library]
        return

    exists = any(
        [x.get("libraryName") == library_name for x in pdk.settings.custom_libraries]
    )

    if not exists:
        pdk.settings.custom_libraries.append(custom_library)
