"""
CartoLayer
==========

Render cloud data from a query.
"""
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, get_error_notifier
from pydeck_carto.layer import MapType, CartoConnection

carto_auth = CartoAuth.from_oauth()

register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=[238, 77, 90],
    point_radius_min_pixels=2.5,
    pickable=True,
    on_data_error=get_error_notifier(),
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_geo_query.html", open_browser=True)
