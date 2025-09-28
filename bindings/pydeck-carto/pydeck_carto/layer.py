import pydeck as pdk

H3_VERSION = "~4.1.*"
DECKGL_VERSION = "~9.0.*"

LIBRARIES_TO_INCLUDE = [
    f"npm/h3-js@{H3_VERSION}/dist/h3-js.umd.js",
    f"npm/@deck.gl/extensions@{DECKGL_VERSION}/dist.min.js",
    f"npm/@deck.gl/carto@{DECKGL_VERSION}/dist.min.js",
]
SELECTED_LIBRARIES = ",".join(LIBRARIES_TO_INCLUDE)
CARTO_LAYER_BUNDLE_URL = f"https://cdn.jsdelivr.net/combine/{SELECTED_LIBRARIES}"


def register_layers():
    """Add carto layers JS bundle to pydeck's custom libraries."""
    library_name = "CartoLibrary"
    custom_library = {
        "libraryName": library_name,
        "resourceUri": CARTO_LAYER_BUNDLE_URL,
    }
    default_layer_attributes = {
        "VectorTileLayer": {"on_data_error": pdk.types.Function("notifyError")},
        "H3TileLayer": {"on_data_error": pdk.types.Function("notifyError")},
        "QuadbinTileLayer": {"on_data_error": pdk.types.Function("notifyError")},
        "RasterTileLayer": {"on_data_error": pdk.types.Function("notifyError")},
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
