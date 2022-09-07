"""
CartoLayer
==========

Render cloud data from a query.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
from pydeck_carto.layer import MapType, CartoConnection

register_carto_layer()
carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=[238, 77, 90],
    point_radius_min_pixels=2.5,
    pickable=True,
)

assert is_valid_carto_layer(layer, carto_auth)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_geo_query.html", open_browser=True)
