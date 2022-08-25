import pydeck as pdk

VERSION = '@~8.8.*'
CARTO_LAYER_BUNDLE_URL = "https://cdn.jsdelivr.net/combine/npm/@deck.gl/" \
                         f"extensions{VERSION}/dist.min.js" \
                         f",npm/@deck.gl/carto{VERSION}/dist.min.js"


class MapType:
    QUERY = pdk.types.String("query")
    TABLE = pdk.types.String("table")
    TILESET = pdk.types.String("tileset")


class CartoConnection:
    CARTO_DW = pdk.types.String("carto_dw")


class GeoColumType:
    H3 = pdk.types.String("h3")
    QUADBIN = pdk.types.String("quadbin")


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
