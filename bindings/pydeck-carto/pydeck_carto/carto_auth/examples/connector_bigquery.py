"""
CartoLayer
==========

Render cloud data from a query.
"""
from pydeck_carto.carto_auth.auth import CartoAuth

ca = CartoAuth("./carto_credentials.json")

bq_client = ca.get_bigquery_client()

table_list = bq_client.list_tables("shared")
print("- Available Big Query Shared tables -")
for table in table_list:
    print(table)

datasets = bq_client.list_datasets()
print("- Available datasets -")
for dataset in datasets:
    ds_info = dataset.friendly_name or dataset.labels
    print(ds_info)
