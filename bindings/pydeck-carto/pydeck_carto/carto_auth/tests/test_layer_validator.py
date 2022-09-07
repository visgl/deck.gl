import os

import pydeck as pdk
import pytest
from pydeck_carto.carto_auth.auth import CartoAuth
from pydeck_carto.carto_auth.layer_validator import is_valid_carto_layer
from pydeck_carto.layer import MapType, CartoConnection, GeoColumnType


@pytest.fixture
def carto_dummy_auth(requests_mock):
    requests_mock.post(
        "https://auth.carto.com/oauth/token",
        json={
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX.payload.signature",
            "scope": "read:tokens write:tokens read:imports write:imports "
            "read:connections write:connections",
            "expires_in": 86400,
            "token_type": "Bearer",
        },
    )
    filepath = "fixtures/mock_credentials.json"
    fullpath = os.path.join(os.path.dirname(__file__), filepath)
    return CartoAuth.from_file(filepath=fullpath, use_cache=False)


@pytest.mark.parametrize(
    "layer_type, must_error",
    (
        (MapType.QUERY, False),
        (MapType.TABLE, False),
        (MapType.TILESET, False),
        ("query", True),
        ("table", True),
        (pdk.types.String("my_own_type"), True),
    ),
)
def test_correct_carto_layer(carto_dummy_auth, layer_type, must_error):
    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
        type_=layer_type,
        connection=CartoConnection.CARTO_DW,
        credentials=carto_dummy_auth.get_layer_credentials(),
        get_fill_color=[238, 77, 90],
        point_radius_min_pixels=2.5,
        pickable=True,
    )
    if must_error:
        with pytest.raises(ValueError):
            assert is_valid_carto_layer(layer, carto_dummy_auth) is True
    else:
        assert is_valid_carto_layer(layer, carto_dummy_auth) is True


def test_check_credential_token():
    correct_token = "header.payload.signature"
    ca = CartoAuth(access_token=correct_token, expires_in=7200)
    correct_layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=ca.get_layer_credentials(),
        get_fill_color=[238, 77, 90],
        point_radius_min_pixels=2.5,
        pickable=True,
    )
    assert is_valid_carto_layer(correct_layer, ca) is True

    with pytest.raises(ValueError):
        incorrect_token = "pepito..signature"
        ca = CartoAuth(access_token=incorrect_token, expires_in=7200)
        layer = pdk.Layer(
            "CartoLayer",
            data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
            type_=MapType.QUERY,
            connection=CartoConnection.CARTO_DW,
            credentials=ca.get_layer_credentials(),
            get_fill_color=[238, 77, 90],
            point_radius_min_pixels=2.5,
            pickable=True,
        )
        _ = is_valid_carto_layer(layer, ca)


@pytest.mark.parametrize(
    "layer_geo_column, must_error",
    (
        (GeoColumnType.H3, False),
        (GeoColumnType.QUADBIN, False),
        (pdk.types.String("randomColumn"), False),
        ("RandomName", True),
    ),
)
def test_geo_column_layer_validity(carto_dummy_auth, layer_geo_column, must_error):
    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=carto_dummy_auth.get_layer_credentials(),
        geo_column=layer_geo_column,
        get_fill_color=[238, 77, 90],
        point_radius_min_pixels=2.5,
        pickable=True,
    )
    if must_error:
        with pytest.raises(ValueError):
            assert is_valid_carto_layer(layer, carto_dummy_auth) is False
    else:
        assert is_valid_carto_layer(layer, carto_dummy_auth) is True


def test_layers_missing_attrs(carto_dummy_auth):
    for mandatory_attr in ["data", "type_", "connection", "credentials"]:
        params = dict(
            data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
            type_=MapType.QUERY,
            connection=CartoConnection.CARTO_DW,
            credentials=carto_dummy_auth.get_layer_credentials(),
        )
        del params[mandatory_attr]

        layer = pdk.Layer("CartoLayer", **params)
        with pytest.raises(ValueError):
            assert is_valid_carto_layer(layer, carto_dummy_auth) is False


def test_list_connections(requests_mock, carto_dummy_auth):
    requests_mock.get(
        "https://api.carto.com/v3/connections",
        json=[
            {
                "name": "my_own_connection",
                "provider_id": "bigquery",
                "config": {
                    "type": "oauth_token",
                    "credentials": {
                        "picture": "picture-url",
                        "expires_in": 1661331110615,
                        "client_email": "super-email@exqample.com",
                    },
                    "billing_project": "my-billing",
                },
                "user_id": "google-oauth2|12345",
                "account_id": "ac_custom",
                "created_at": "2022-08-24T07:52:22.169Z",
                "updated_at": "2022-08-24T10:50:56.468Z",
                "id": "8b9d630e-ddb5-4796-8a16-d2323072fbbb",
                "spatial_extension": False,
                "privacy": "private",
                "owner_picture": "https://pictures-owner.jpg",
                "mapcount": 1,
                "carto_dw": False,
            },
        ],
    )

    conns = carto_dummy_auth.list_connections()
    assert isinstance(conns, list)

    random_str_connection = "myrandom_connnection"
    assert random_str_connection not in conns

    first_connection = "my_own_connection"
    assert first_connection in conns
