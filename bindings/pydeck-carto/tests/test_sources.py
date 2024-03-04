from pydeck_carto.sources import (
    vector_table_source,
    vector_query_source,
    vector_tileset_source,
)


def test_vector_table_source():
    assert vector_table_source(
        table_name="project.database.table",
        spatial_data_column="geom",
        connection_name="carto_dw",
        access_token="1234",
        api_base_url="https://carto.com",
    ).serialize() == {
        "@@function": "vectorTableSource",
        "tableName": "project.database.table",
        "spatialDataColumn": "geom",
        "connectionName": "carto_dw",
        "accessToken": "1234",
        "apiBaseUrl": "https://carto.com",
        "clientId": "pydeck-carto",
    }


def vector_query_source():
    assert vector_query_source(
        sql_query="select * from project.database.table",
        spatial_data_column="geom",
        connection_name="carto_dw",
        access_token="1234",
        api_base_url="https://carto.com",
    ).serialize() == {
        "@@function": "vectorQuerySource",
        "sqlQuery": "select * from project.database.table",
        "spatialDataColumn": "geom",
        "connectionName": "carto_dw",
        "accessToken": "1234",
        "apiBaseUrl": "https://carto.com",
        "clientId": "pydeck-carto",
    }


def test_vector_tileset_source():
    assert vector_tileset_source(
        table_name="project.database.table",
        connection_name="carto_dw",
        access_token="1234",
        api_base_url="https://carto.com",
    ).serialize() == {
        "@@function": "vectorTilesetSource",
        "tableName": "project.database.table",
        "connectionName": "carto_dw",
        "accessToken": "1234",
        "apiBaseUrl": "https://carto.com",
        "clientId": "pydeck-carto",
    }
