"""
CartoLayer
==========

Use CARTO DW client (BigQuery)
"""
from pydeck_carto import CartoAuth

ca = CartoAuth.from_file("./carto_credentials.json")

cdw_client = ca.get_carto_dw_client()

datasets = cdw_client.list_datasets()
print("- Available datasets -")
for dataset in datasets:
    ds_info = dataset.friendly_name or dataset.labels
    print(ds_info)

table_list = cdw_client.list_tables("shared")
print("- Available Big Query Shared tables -")
for table in table_list:
    print(table)
