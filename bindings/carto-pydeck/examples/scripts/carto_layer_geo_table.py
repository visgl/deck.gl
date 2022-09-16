"""
CartoLayer
==========

Render cloud data from a table.
"""
import pydeck as pdk

from carto_auth import CartoAuth
from carto_pydeck import register_carto_layer, get_layer_credentials, notify_error
from carto_pydeck.layer import MapType, CartoConnection

register_carto_layer()

carto_auth = CartoAuth.from_oauth()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.airports",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=[200, 0, 80],
    point_radius_min_pixels=2,
    pickable=True,
    on_data_error=notify_error(),
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_geo_table.html", open_browser=True)
