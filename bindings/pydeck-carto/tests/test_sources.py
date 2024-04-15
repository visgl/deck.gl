from pydeck_carto.sources import (
    vector_table_source,
    vector_query_source,
    vector_tileset_source,
    h3_table_source,
    h3_query_source,
    h3_tileset_source,
    quadbin_table_source,
    quadbin_query_source,
    quadbin_tileset_source,
)
from typing import Any

base_options: Any = {
    "connection_name": "carto_dw",
    "access_token": "1234",
    "api_base_url": "https://carto.com",
}

base_options_serialized: Any = {
    "connectionName": "carto_dw",
    "accessToken": "1234",
    "apiBaseUrl": "https://carto.com",
    "clientId": "pydeck-carto",
}

# VECTOR


def test_vector_table_source():
    assert vector_table_source(
        table_name="project.database.table",
        spatial_data_column="geom",
        **base_options,
    ).serialize() == {
        "@@function": "vectorTableSource",
        "tableName": "project.database.table",
        "spatialDataColumn": "geom",
        "columns": None,
        **base_options_serialized,
    }


def test_vector_query_source():
    assert vector_query_source(
        sql_query="select * from project.database.table",
        spatial_data_column="geom",
        **base_options,
    ).serialize() == {
        "@@function": "vectorQuerySource",
        "sqlQuery": "select * from project.database.table",
        "spatialDataColumn": "geom",
        "columns": None,
        **base_options_serialized,
    }


def test_vector_tileset_source():
    assert vector_tileset_source(
        table_name="project.database.table",
        **base_options,
    ).serialize() == {
        "@@function": "vectorTilesetSource",
        "tableName": "project.database.table",
        **base_options_serialized,
    }


# H3


def test_h3_table_source():
    assert h3_table_source(
        table_name="project.database.table",
        spatial_data_column="geom",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "h3TableSource",
        "tableName": "project.database.table",
        "spatialDataColumn": "geom",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


def test_h3_query_source():
    assert h3_query_source(
        sql_query="select * from project.database.table",
        spatial_data_column="geom",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "h3QuerySource",
        "sqlQuery": "select * from project.database.table",
        "spatialDataColumn": "geom",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


def test_h3_tileset_source():
    assert h3_tileset_source(
        table_name="project.database.table",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "h3TilesetSource",
        "tableName": "project.database.table",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


# QUADBIN


def test_quadbin_table_source():
    assert quadbin_table_source(
        table_name="project.database.table",
        spatial_data_column="geom",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "quadbinTableSource",
        "tableName": "project.database.table",
        "spatialDataColumn": "geom",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


def test_quadbin_query_source():
    assert quadbin_query_source(
        sql_query="select * from project.database.table",
        spatial_data_column="geom",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "quadbinQuerySource",
        "sqlQuery": "select * from project.database.table",
        "spatialDataColumn": "geom",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


def test_quadbin_tileset_source():
    assert quadbin_tileset_source(
        table_name="project.database.table",
        aggregation_exp="SUM(pop) AS total_population",
        aggregation_res_level=6,
        **base_options,
    ).serialize() == {
        "@@function": "quadbinTilesetSource",
        "tableName": "project.database.table",
        "aggregationExp": "SUM(pop) AS total_population",
        "aggregationResLevel": 6,
        **base_options_serialized,
    }


# RASTER


def test_raster_tileset_source():
    assert True  # TODO
