"""
CartoLayer
==========

Render cloud data in Quadbin grid from a table.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
from pydeck_carto.layer import CartoConnection, MapType, GeoColumnType

register_carto_layer()
carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables"
    ".derived_spatialfeatures_esp_quadbin15_v1_yearly_v2",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    geo_column=GeoColumnType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_spatial_quadbin_table.html", open_browser=True)
