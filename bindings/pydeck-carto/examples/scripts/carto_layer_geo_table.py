"""
CartoLayer
==========

Render cloud data from a table.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

data = pdkc.sources.vector_table_source(
    access_token=carto_auth.get_access_token(),
    api_base_url=carto_auth.get_api_base_url(),
    connection_name="carto_dw",
    table_name="carto-demo-data.demo_tables.world_airports",
)

layer = pdk.Layer(
    "VectorTileLayer",
    data=data,
    get_fill_color=[200, 0, 80],
    point_radius_min_pixels=2,
    pickable=True,
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_layer_geo_table.html"))
