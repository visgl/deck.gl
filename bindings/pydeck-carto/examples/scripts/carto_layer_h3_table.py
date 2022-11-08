"""
CartoLayer
==========

Render cloud data in H3 grid from a table.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth

carto_auth = CartoAuth.from_oauth()

pdkc.register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.derived_spatialfeatures_esp_h3res8_v1_yearly_v2",
    type_=pdkc.MapType.TABLE,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    geo_column=pdkc.GeoColumnType.H3,
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_h3_table.html", open_browser=True)
