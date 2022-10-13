import pydeck as pdk

H3_VERSION = "~3.7.*"
DECKGL_VERSION = "~8.8.12"

LIBRARIES_TO_INCLUDE = [
    f"npm/h3-js@{H3_VERSION}/dist/h3-js.umd.js",
    f"npm/@deck.gl/extensions@{DECKGL_VERSION}/dist.min.js",
    f"npm/@deck.gl/carto@{DECKGL_VERSION}/dist.min.js",
]
SELECTED_LIBRARIES = ",".join(LIBRARIES_TO_INCLUDE)
CARTO_LAYER_BUNDLE_URL = f"https://cdn.jsdelivr.net/combine/{SELECTED_LIBRARIES}"


class MapType:
    QUERY = pdk.types.String("query")
    TABLE = pdk.types.String("table")
    TILESET = pdk.types.String("tileset")


class CartoConnection:
    CARTO_DW = pdk.types.String("carto_dw")


class GeoColumnType:
    H3 = pdk.types.String("h3")
    QUADBIN = pdk.types.String("quadbin")


def register_carto_layer():
    """Add CartoLayer JS bundle to pydeck's custom libraries."""
    library_name = "CartoLayerLibrary"
    custom_library = {
        "libraryName": library_name,
        "resourceUri": CARTO_LAYER_BUNDLE_URL,
    }
    default_layer_attributes = {
        "CartoLayer": {
            "client_id": pdk.types.String("pydeck-carto"),
            "on_data_error": pdk.types.Function("notifyError"),
        }
    }
    configuration = """{
        functions: {
            notifyError: () => {
                return (e) => {
                    document.body.style.cssText = 'padding:24px;font-size:14px;font-family:monospace';
                    document.body.innerHTML = `<b>Layer Error</b>: ${e.message}`;
                }
            }
        }
    }"""  # noqa

    if pdk.settings.configuration is None:
        pdk.settings.configuration = configuration

    if pdk.settings.default_layer_attributes is None:
        pdk.settings.default_layer_attributes = default_layer_attributes
    else:
        pdk.settings.default_layer_attributes = {
            **pdk.settings.default_layer_attributes,
            **default_layer_attributes,
        }

    if pdk.settings.custom_libraries is None:
        pdk.settings.custom_libraries = [custom_library]
    else:
        exists = any(
            [
                x.get("libraryName") == library_name
                for x in pdk.settings.custom_libraries
            ]
        )
        if not exists:
            pdk.settings.custom_libraries.append(custom_library)


def get_layer_credentials(carto_auth) -> dict:
    """Get the layer credentials object to gather information
    from carto warehouses.

    The return object has the following structure:
    ``{"apiVersion": "v3", "apiBaseUrl": "...", "accessToken": "...",}``
    """
    access_token = carto_auth.get_access_token()
    return {
        "apiVersion": "v3",
        "apiBaseUrl": carto_auth.api_base_url,
        "accessToken": access_token,
    }
