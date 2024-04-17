"""
CartoLayer
==========

Render cloud data in H3 grid from a table.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

data = pdkc.sources.h3_table_source(
    access_token=carto_auth.get_access_token(),
    api_base_url=carto_auth.get_api_base_url(),
    connection_name="carto_dw",
    table_name="carto-demo-data.demo_tables.derived_spatialfeatures_esp_h3res8_v1_yearly_v2",
    aggregation_exp="sum(population) as population_sum",
)

layer = pdk.Layer(
    "H3TileLayer",
    data=data,
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_layer_h3_table.html"))
