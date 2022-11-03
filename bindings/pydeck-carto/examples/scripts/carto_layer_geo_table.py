"""
CartoLayer
==========

Render cloud data from a table.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth

carto_auth = CartoAuth.from_oauth()

pdkc.register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.airports",
    type_=pdkc.MapType.TABLE,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    get_fill_color=[200, 0, 80],
    point_radius_min_pixels=2,
    pickable=True,
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_geo_table.html", open_browser=True)
