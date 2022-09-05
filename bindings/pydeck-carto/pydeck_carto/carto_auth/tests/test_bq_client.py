"""
Test the BigQuery client connector created from a CartoAuth object

Creation of the bq client
requesting:
* datasets = client.list_datasets()
* tables = client.list_tables('shared')

"""
import os

from pydeck_carto import CartoAuth
from google.cloud.bigquery import Client as GClient

dummy_response = {
    "projectId": "project-id-mock",
    "token": "token-mock",
}


def test_cw_credentials(requests_mock):
    requests_mock.get(
        "https://gcp-us-east1.api.carto.com/v3/connections/carto-dw/token",
        json=dummy_response,
    )
    cache_filepath = "fixtures/.carto_token.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    ca = CartoAuth(cache_filepath=fullpath)

    carto_dw_project_id, carto_dw_token = ca.get_carto_dw_credentials()
    assert carto_dw_project_id == "project-id-mock"
    assert carto_dw_token == "token-mock"


def test_big_query_client(requests_mock):
    requests_mock.get(
        "https://gcp-us-east1.api.carto.com/v3/connections/carto-dw/token",
        json=dummy_response,
    )
    cache_filepath = "fixtures/.carto_token.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    ca = CartoAuth(cache_filepath=fullpath)

    bq_client = ca.get_carto_dw_client()
    assert bq_client is not None

    assert hasattr(bq_client, "query")
    assert isinstance(bq_client, GClient)
