"""
Test the BigQuery client connector created from a CartoAuth object

Creation of the bq client
requesting:
* datasets = client.list_datasets()
* tables = client.list_tables('shared')

"""
import os

from pydeck_carto.carto_auth.auth import CartoAuth
from google.cloud.bigquery import Client as GClient

dummy_response = {
    "projectId": "carto-dw-ac-hbnregaf",
    "token": "ya29.c.b0AXv0zTP4-ML3gMXEIiZTy5HRkAUKYCKNtI_8UUx6Ziu4y7jXC5lnetZyXXvLir1CNAzA918XqufrFhUKMlcjNBFOrODlUM_2yEFb9Oz-1zC5hVVoMt9Lmcl7_P1u_b2M6Xc2y_4PFN52xluoHJIx4GFrKDX9EQZiaveci6Mux1pWG47WfwYn3Pk80Cvnik7-1_kXPUZA26Qo5Dy-uuVW3HMgtL_JiAA........................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................",  # noqa: E501
}


def test_cw_credentials(requests_mock):
    requests_mock.get(
        "https://gcp-europe-west1.api.carto.com/v3/connections/carto-dw/token",
        json=dummy_response,
    )
    cache_filepath = "fixtures/.carto_token.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    ca = CartoAuth(cache_filepath=fullpath)

    carto_dw_project_id, carto_dw_token = ca.cw_credentials()
    assert carto_dw_project_id is not None
    assert carto_dw_token is not None


def test_big_query_client(requests_mock):
    requests_mock.get(
        "https://gcp-europe-west1.api.carto.com/v3/connections/carto-dw/token",
        json=dummy_response,
    )
    cache_filepath = "fixtures/.carto_token.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    ca = CartoAuth(cache_filepath=fullpath)

    bq_client = ca.get_bigquery_client()
    assert bq_client is not None

    assert hasattr(bq_client, "query")
    assert isinstance(bq_client, GClient)

    # table_list = bq_client.list_tables("shared")
    # assert len(table_list) > 0

    # datasets = [x for x in bq_client.list_datasets()]
    # assert len(datasets) > 0
