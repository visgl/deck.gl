import pydeck as pdk


def base_source(connection_name: str, access_token: str, api_base_url: str):
    return {
        "connectionName": connection_name,
        "accessToken": access_token,
        "apiBaseUrl": api_base_url,
        "clientId": "pydeck-carto",
    }


def vector_table_source(table_name: str, spatial_data_column: str, **kwargs):
    return pdk.types.Function(
        "vectorTableSource",
        **{
            "tableName": table_name,
            "spatialDataColumn": spatial_data_column,
            **base_source(**kwargs),
        }
    )


def vector_query_source(sql_query: str, spatial_data_column: str, **kwargs):
    return pdk.types.Function(
        "vectorQuerySource",
        **{
            "sqlQuery": sql_query,
            "spatialDataColumn": spatial_data_column,
            **base_source(**kwargs),
        }
    )


def vector_tileset_source(table_name: str, **kwargs):
    return pdk.types.Function(
        "vectorTilesetSource", **{"tableName": table_name, **base_source(**kwargs)}
    )


# TODO: Implement all the source functions and parameters
# https://felixpalmer.github.io/deck.gl/docs/api-reference/carto/data-sources
# h3_table_source
# h3_query_source
# h3_tileset_source
# quadbin_table_source
# quadbin_query_source
# quadbin_tileset_source
# raster_tileset_source (experimental)
