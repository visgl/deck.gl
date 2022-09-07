from pydeck import Layer, types
from pydeck_carto.carto_auth.auth import CartoAuth
from pydeck_carto.layer import MapType, CartoConnection


def validate_attr(layer, attr, param_type):
    if not hasattr(layer, attr):
        raise ValueError(f"Missing parameter {attr} on the layer")
    attr_value = getattr(layer, attr)
    if not attr_value:
        raise ValueError(f"Parameter {attr} not valid")
    if not isinstance(attr_value, param_type):
        raise ValueError(f"Parameter {attr} must be a {param_type}")


def is_valid_carto_layer(layer: Layer, carto_auth: CartoAuth):
    if layer.type != "CartoLayer":
        raise ValueError('The layer type must be "CartoLayer"')

    validate_attr(layer, "credentials", dict)
    validate_attr(layer, "data", str)
    validate_attr(layer, "type_", types.String)
    validate_attr(layer, "connection", types.String)

    if hasattr(layer, "geo_column") and layer.geo_column is not None:
        validate_attr(layer, "geo_column", types.String)

    if layer.type_ not in [MapType.QUERY, MapType.TABLE, MapType.TILESET]:
        raise ValueError("Invalid layer type selected")

    for attr in ("accessToken", "apiVersion", "apiBaseUrl"):
        if attr not in layer.credentials:
            raise ValueError(f"Missing {attr} from layer.credentials")

    token_parts = layer.credentials["accessToken"].split(".")
    if len(token_parts) != 3:
        raise ValueError("Access token with wrong format")
    else:
        for part, part_label in zip(token_parts, ["header", "payload", "signature"]):
            if not part:
                raise ValueError(f'Missing "{part_label}" of the token')

    if layer.connection != CartoConnection.CARTO_DW:
        available_connections = carto_auth.list_connections()
        if layer.connection not in available_connections:
            raise ValueError(
                f"Invalid connection selected {layer.connection},"
                f" choose one of {available_connections}"
            )

    if layer.type_ == MapType.QUERY:
        cnt_params_expected = layer.data.count("?")
        if cnt_params_expected > 0 and cnt_params_expected != len(
            layer.query_parameters
        ):
            raise ValueError(
                "Mismatch query_parameters and parameters expected on the query"
            )

    return True
