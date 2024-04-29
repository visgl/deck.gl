import pydeck as pdk
from typing import TypedDict, List, Union
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


QueryParameterValue = Union[str, int, float, bool]


class QuerySourceOptions(BaseSourceOptions):
    sql_query: str
    spatial_data_column: NotRequired[str]
    query_parameters: NotRequired[
        List[Union[QueryParameterValue, List[QueryParameterValue]]]
    ]


class TilesetSourceOptions(BaseSourceOptions):
    table_name: str


class ColumnOptions(Options):
    columns: NotRequired[List[str]]


class AggregationOptions(Options):
    aggregation_exp: str
    aggregation_res_level: NotRequired[int]


# VALIDATORS


def validate_str(args: Options, arg: str, required: bool = True):
    """Validates given key on an options object is a string."""
    if arg not in args and required:
        raise AssertionError('Missing argument "{}".'.format(arg))
    elif arg in args:
        assert type(args[arg]) is str, "Argument {} must be of type str".format(arg)


def validate_int(args: Options, arg: str, required: bool = True):
    """Validates given key on an options object is an int."""
    if arg not in args and required:
        raise AssertionError('Missing argument "{}".'.format(arg))
    elif arg in args:
        assert type(args[arg]) is int, "Argument {} must be of type int".format(arg)


# BASE SOURCES


def base_options(**kwargs: Unpack[BaseSourceOptions]):
    assert_type(kwargs, BaseSourceOptions)
    validate_str(kwargs, "connection_name")
    validate_str(kwargs, "access_token")
    validate_str(kwargs, "api_base_url")
    return {
        "connectionName": kwargs["connection_name"],
        "accessToken": kwargs["access_token"],
        "apiBaseUrl": kwargs["api_base_url"],
        "clientId": "pydeck-carto",
    }


def table_options(**kwargs: Unpack[TableSourceOptions]):
    assert_type(kwargs, TableSourceOptions)
    validate_str(kwargs, "table_name")
    validate_str(kwargs, "spatial_data_column", False)
    return {
        "tableName": kwargs.get("table_name"),
        **(
            {"spatialDataColumn": kwargs["spatial_data_column"]}
            if "spatial_data_column" in kwargs
            else {}
        ),
        **base_options(**kwargs),
    }


def query_options(**kwargs: Unpack[QuerySourceOptions]):
    assert_type(kwargs, QuerySourceOptions)
    validate_str(kwargs, "sql_query")
    validate_str(kwargs, "spatial_data_column", False)
    return {
        "sqlQuery": kwargs.get("sql_query"),
        **(
            {"spatialDataColumn": kwargs["spatial_data_column"]}
            if "spatial_data_column" in kwargs
            else {}
        ),
        **(
            {"queryParameters": kwargs["query_parameters"]}
            if "query_parameters" in kwargs
            else {}
        ),
        **base_options(**kwargs),
    }


def tileset_options(**kwargs: Unpack[TilesetSourceOptions]):
    assert_type(kwargs, TilesetSourceOptions)
    validate_str(kwargs, "table_name")
    return {
        "tableName": kwargs["table_name"],
        **base_options(**kwargs),
    }


def column_options(**kwargs: Unpack[ColumnOptions]):
    assert_type(kwargs, ColumnOptions)
    return {"columns": kwargs["columns"]} if "columns" in kwargs else {}


def aggregation_options(**kwargs: Unpack[AggregationOptions]):
    assert_type(kwargs, AggregationOptions)
    validate_str(kwargs, "aggregation_exp")
    validate_int(kwargs, "aggregation_res_level", False)
    return {
        "aggregationExp": kwargs["aggregation_exp"],
        **(
            {"aggregationResLevel": kwargs["aggregation_res_level"]}
            if "aggregation_res_level" in kwargs
            else {}
        ),
    }


# VECTOR SOURCES


class VectorTableSourceOptions(TableSourceOptions, ColumnOptions):
    """Options for vector_table_source."""

    pass


class VectorQuerySourceOptions(QuerySourceOptions, ColumnOptions):
    """Options for vector_query_source."""

    pass


class VectorTilesetSourceOptions(TilesetSourceOptions):
    """Options for vector_tileset_source."""

    pass


def vector_table_source(**kwargs: Unpack[VectorTableSourceOptions]):
    """Defines a table as a data source for one or more vector layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    columns : List[str], optional
        List of table columns to be loaded.
    """
    return pdk.types.Function(
        "vectorTableSource", **{**column_options(**kwargs), **table_options(**kwargs)}
    ).serialize()


def vector_query_source(**kwargs: Unpack[VectorQuerySourceOptions]):
    """Defines a query as a data source for one or more vector layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str, optional
        Access token, see *Authentication*.
    api_base_url : str
        API base URL, see *Authentication*.
    sql_query : str
        SQL query.
    query_parameters : List[str], optional
        List of positional SQL parameters.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    columns : List[str], optional
        List of table columns to be loaded.
    """
    return pdk.types.Function(
        "vectorQuerySource", **{**column_options(**kwargs), **query_options(**kwargs)}
    ).serialize()


def vector_tileset_source(**kwargs: Unpack[VectorTilesetSourceOptions]):
    """Defines a tileset as a data source for one or more vector layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    """
    return pdk.types.Function(
        "vectorTilesetSource", **tileset_options(**kwargs)
    ).serialize()


# H3 SOURCES


class H3TableSourceOptions(TableSourceOptions, AggregationOptions):
    """Options for h3_table_source."""

    pass


class H3QuerySourceOptions(QuerySourceOptions, AggregationOptions):
    """Options for h3_query_source."""

    pass


class H3TilesetSourceOptions(TilesetSourceOptions):
    """Options for h3_tileset_source."""

    pass


def h3_table_source(**kwargs: Unpack[H3TableSourceOptions]):
    """Defines a table as a data source for one or more H3 layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    aggregation_exp : str, optional
        Aggregation SQL expression. Only used for spatial index datasets.
    aggregation_res_level : int, optional
        Aggregation resolution level. Only used for spatial index datasets,
        defaults to 6 for quadbins, 4 for h3.
    """
    return pdk.types.Function(
        "h3TableSource", **{**aggregation_options(**kwargs), **table_options(**kwargs)}
    ).serialize()


def h3_query_source(**kwargs: Unpack[H3QuerySourceOptions]):
    """Defines a query as a data source for one or more H3 layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    sql_query : str
        SQL query.
    query_parameters : List[str], optional
        List of positional SQL parameters.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    aggregation_exp : str
        Aggregation SQL expression. Only used for spatial index datasets.
    aggregation_res_level : int, optional
        Aggregation resolution level. Only used for spatial index datasets,
        defaults to 6 for quadbins, 4 for h3.
    """
    return pdk.types.Function(
        "h3QuerySource", **{**aggregation_options(**kwargs), **query_options(**kwargs)}
    ).serialize()


def h3_tileset_source(**kwargs: Unpack[H3TilesetSourceOptions]):
    """Defines a tileset as a data source for one or more H3 layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    """
    return pdk.types.Function(
        "h3TilesetSource", **tileset_options(**kwargs)
    ).serialize()


# QUADBIN SOURCES


class QuadbinTableSourceOptions(TableSourceOptions, AggregationOptions):
    """Options for quadbin_table_source."""

    pass


class QuadbinQuerySourceOptions(QuerySourceOptions, AggregationOptions):
    """Options for quadbin_query_source."""

    pass


class QuadbinTilesetSourceOptions(TilesetSourceOptions):
    """Options for quadbin_tileset_source."""

    pass


def quadbin_table_source(**kwargs: Unpack[QuadbinTableSourceOptions]):
    """Defines a table as a data source for one or more quadbin layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    aggregation_exp : str
        Aggregation SQL expression. Only used for spatial index datasets.
    aggregation_res_level : int, optional
        Aggregation resolution level. Only used for spatial index datasets,
        defaults to 6 for quadbins, 4 for h3.
    """
    return pdk.types.Function(
        "quadbinTableSource",
        **{**aggregation_options(**kwargs), **table_options(**kwargs)}
    ).serialize()


def quadbin_query_source(**kwargs: Unpack[QuadbinQuerySourceOptions]):
    """Defines a query as a data source for one or more quadbin layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    sql_query : str
        SQL query.
    query_parameters : List[str], optional
        List of positional SQL parameters.
    spatial_data_column : str, optional
        Name of spatial data column. Common examples are "geom", "h3", or "quadbin".
    aggregation_exp : str
        Aggregation SQL expression. Only used for spatial index datasets.
    aggregation_res_level : int, optional
        Aggregation resolution level. Only used for spatial index datasets,
        defaults to 6 for quadbins, 4 for h3.
    """
    return pdk.types.Function(
        "quadbinQuerySource",
        **{**aggregation_options(**kwargs), **query_options(**kwargs)}
    ).serialize()


def quadbin_tileset_source(**kwargs: Unpack[QuadbinTilesetSourceOptions]):
    """Defines a tileset as a data source for one or more quadbin layers.

    Parameters
    ----------
    connection_name : str
        Name of the connection registered in the CARTO Workspace. CARTO Data
        Warehouse connection name is "carto_dw".
    access_token : str
        Access token, see *Authentication*.
    api_base_url : str, optional
        API base URL, see *Authentication*.
    table_name : str
        Fully-qualified name of table.
    """
    return pdk.types.Function(
        "quadbinTilesetSource", **tileset_options(**kwargs)
    ).serialize()


# RASTER SOURCES (EXPERIMENTAL)


def raster_tileset_source(**kwargs):
    """EXPERIMENTAL."""
    raise RuntimeError("not implemented")
