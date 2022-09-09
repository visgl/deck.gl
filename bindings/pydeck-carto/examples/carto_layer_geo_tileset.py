"""
CartoLayer
==========

Render cloud data from a tileset.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()
carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.pointsofinterest_esp",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=[200, 0, 80],
    stroked=False,
    point_radius_min_pixels=2,
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_geo_tileset.html", open_browser=True)
