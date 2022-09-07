"""
CartoLayer
==========

Render cloud data in Quadbin grid from a tileset.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()
carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets"
    ".derived_spatialfeatures_usa_quadbin15_v1_yearly_v2_tileset",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=[200, 0, 80],
    pickable=True,
)

assert is_valid_carto_layer(layer, carto_auth)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_quadbin_tileset.html", open_browser=True)
