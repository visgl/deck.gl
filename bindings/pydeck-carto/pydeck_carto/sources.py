import pydeck as pdk
from typing import TypedDict, List
from typing_extensions import NotRequired, Unpack, assert_type

# TYPES


class Options(TypedDict):
    pass


class BaseSourceOptions(Options):
    connection_name: str
    access_token: str
    api_base_url: str


class TableSourceOptions(BaseSourceOptions):
    table_name: str
    spatial_data_column: NotRequired[str]


class QuerySourceOptions(BaseSourceOptions):
    sql_query: str
    spatial_data_column: NotRequired[str]


class TilesetSourceOptions(BaseSourceOptions):
    table_name: str


class ColumnOptions(Options):
    columns: NotRequired[List[str]]


class AggregationOptions(Options):
    aggregation_exp: str
    aggregation_res_level: NotRequired[int]


# VALIDATORS

# The 'interface' arguments are unused, but could be used with
# 'get_type_hints' to provide type hints in the future.


def validate_str(
    interface: type[Options], args: Options, arg: str, required: bool = True
):
    """Validates given key on an options object is a string."""
    if arg not in args and required:
        raise AssertionError('Missing argument "{}".'.format(arg))
    elif arg in args:
        assert type(args[arg]) is str, "Argument {} must be of type str".format(arg)


def validate_int(
    interface: type[Options], args: Options, arg: str, required: bool = True
):
    """Validates given key on an options object is an int."""
    if arg not in args and required:
        raise AssertionError('Missing argument "{}".'.format(arg))
    elif arg in args:
        assert type(args[arg]) is int, "Argument {} must be of type int".format(arg)


# BASE


def base_options(**kwargs: Unpack[BaseSourceOptions]):
    assert_type(kwargs, BaseSourceOptions)
    validate_str(BaseSourceOptions, kwargs, "connection_name")
    validate_str(BaseSourceOptions, kwargs, "access_token")
    validate_str(BaseSourceOptions, kwargs, "api_base_url")
    return {
        "connectionName": kwargs["connection_name"],
        "accessToken": kwargs["access_token"],
        "apiBaseUrl": kwargs["api_base_url"],
        "clientId": "pydeck-carto",
    }


def table_options(**kwargs: Unpack[TableSourceOptions]):
    assert_type(kwargs, TableSourceOptions)
    validate_str(TableSourceOptions, kwargs, "table_name")
    validate_str(TableSourceOptions, kwargs, "spatial_data_column", False)
    return {
        "tableName": kwargs.get("table_name"),
        "spatialDataColumn": kwargs.get("spatial_data_column"),
        **base_options(**kwargs),
    }


def query_options(**kwargs: Unpack[QuerySourceOptions]):
    assert_type(kwargs, QuerySourceOptions)
    validate_str(TableSourceOptions, kwargs, "sql_query")
    validate_str(TableSourceOptions, kwargs, "spatial_data_column", False)
    return {
        "sqlQuery": kwargs.get("sql_query"),
        "spatialDataColumn": kwargs.get("spatial_data_column"),
        **base_options(**kwargs),
    }


def tileset_options(**kwargs: Unpack[TilesetSourceOptions]):
    assert_type(kwargs, TilesetSourceOptions)
    validate_str(TableSourceOptions, kwargs, "table_name")
    return {
        "tableName": kwargs["table_name"],
        **base_options(**kwargs),
    }


def column_options(**kwargs: Unpack[ColumnOptions]):
    assert_type(kwargs, ColumnOptions)
    return {"columns": kwargs.get("columns")}


def aggregation_options(**kwargs: Unpack[AggregationOptions]):
    assert_type(kwargs, AggregationOptions)
    validate_str(AggregationOptions, kwargs, "aggregation_exp")
    validate_int(AggregationOptions, kwargs, "aggregation_res_level", False)
    return {
        "aggregationExp": kwargs["aggregation_exp"],
        "aggregationResLevel": kwargs.get("aggregation_res_level"),
    }


# VECTOR


class VectorTableSourceOptions(TableSourceOptions, ColumnOptions):
    pass


class VectorQuerySourceOptions(QuerySourceOptions, ColumnOptions):
    pass


class VectorTilesetSourceOptions(TilesetSourceOptions):
    pass


def vector_table_source(**kwargs: Unpack[VectorTableSourceOptions]):
    return pdk.types.Function(
        "vectorTableSource", **{**column_options(**kwargs), **table_options(**kwargs)}
    )


def vector_query_source(**kwargs: Unpack[VectorQuerySourceOptions]):
    return pdk.types.Function(
        "vectorQuerySource", **{**column_options(**kwargs), **query_options(**kwargs)}
    )


def vector_tileset_source(**kwargs: Unpack[VectorTilesetSourceOptions]):
    return pdk.types.Function("vectorTilesetSource", **tileset_options(**kwargs))


# H3


class H3TableSourceOptions(TableSourceOptions, AggregationOptions):
    pass


class H3QuerySourceOptions(QuerySourceOptions, AggregationOptions):
    pass


class H3TilesetSourceOptions(TilesetSourceOptions, AggregationOptions):
    pass


def h3_table_source(**kwargs: Unpack[H3TableSourceOptions]):
    return pdk.types.Function(
        "h3TableSource", **{**aggregation_options(**kwargs), **table_options(**kwargs)}
    )


def h3_query_source(**kwargs: Unpack[H3QuerySourceOptions]):
    return pdk.types.Function(
        "h3QuerySource", **{**aggregation_options(**kwargs), **query_options(**kwargs)}
    )


def h3_tileset_source(**kwargs: Unpack[H3TilesetSourceOptions]):
    return pdk.types.Function(
        "h3TilesetSource",
        **{**aggregation_options(**kwargs), **tileset_options(**kwargs)}
    )


# QUADBIN


class QuadbinTableSourceOptions(TableSourceOptions, AggregationOptions):
    pass


class QuadbinQuerySourceOptions(QuerySourceOptions, AggregationOptions):
    pass


class QuadbinTilesetSourceOptions(TilesetSourceOptions, AggregationOptions):
    pass


def quadbin_table_source(**kwargs: Unpack[QuadbinTableSourceOptions]):
    return pdk.types.Function(
        "quadbinTableSource",
        **{**aggregation_options(**kwargs), **table_options(**kwargs)}
    )


def quadbin_query_source(**kwargs: Unpack[QuadbinQuerySourceOptions]):
    return pdk.types.Function(
        "quadbinQuerySource",
        **{**aggregation_options(**kwargs), **query_options(**kwargs)}
    )


def quadbin_tileset_source(**kwargs: Unpack[QuadbinTilesetSourceOptions]):
    return pdk.types.Function(
        "quadbinTilesetSource",
        **{**aggregation_options(**kwargs), **tileset_options(**kwargs)}
    )


# RASTER (EXPERIMENTAL)


def raster_tileset_source(**kwargs):
    """EXPERIMENTAL."""
    raise RuntimeError("not implemented")
