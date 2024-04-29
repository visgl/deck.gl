CHANGELOG
=========

Releases and associated GitHub PRs for pydeck-carto are documented here.

0.2 Releases
------------

0.2.0b0 - Apr 24 2024
^^^^^^^^^^^^^^^^^^^^^
- Update to deck.gl v9.0
- Rename register_carto_layer to register_layers
- Add layer enums: VectorTileLayer, H3TileLayer, QuadbinTileLayer
- Add source functions: vector_table_source, vector_query_source, vector_tileset_source, h3_table_source, h3_query_source, h3_tileset_source, quadbin_table_source, quadbin_query_source, quadbin_tileset_source

0.1 Releases
------------

0.1.1b0 - Apr 24 2024
^^^^^^^^^^^^^^^^^^^^^
- Update to deck.gl v8.9

0.1.0 - Nov 04 2022
^^^^^^^^^^^^^^^^^^^
- Add register_carto_layer function: integration with pydeck (CartoLayer).
- Add get_layer_credentials function: integration with carto-auth.
- Add layer enums: MapType, CartoConnection, GeoColumnType.
- Add styling functions: color_bins, color_categories, color continuous.
- Add implicit on_data_error notifier
