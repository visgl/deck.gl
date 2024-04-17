"""
CartoLayer
==========

Render cloud data in Quadbin grid from a table.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables"
    ".derived_spatialfeatures_esp_quadbin15_v1_yearly_v2",
    type_=pdkc.MapType.TABLE,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    geo_column=pdkc.GeoColumnType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_layer_quadbin_table.html"))
