"""
Test the BigQuery client connector created from a CartoAuth object

Creation of the bq client
requesting:
* datasets = client.list_datasets()
* tables = client.list_tables('shared')

"""
from pydeck_carto.auth.auth import CartoAuth


def test_cw_credentials():
    filepath = "fixtures/mock_credentials.json"
    ca = CartoAuth(filepath=filepath)

    carto_dw_project_id, carto_dw_token = ca.cw_credentials()
    assert carto_dw_project_id is not None
    assert carto_dw_token is not None


def test_big_query_client():
    filepath = "fixtures/mock_credentials.json"
    ca = CartoAuth(filepath=filepath)

    bq_client = ca.get_bigquery_client()
    assert bq_client is not None

    assert hasattr(bq_client, "query")

    table_list = bq_client.client.list_tables("shared")
    assert len(table_list) > 0

    datasets = bq_client.list_datasets()
    assert len(datasets) > 0
