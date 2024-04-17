"""
CartoLayer
==========

Render cloud data in Quadbin grid from a tileset.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets"
    ".derived_spatialfeatures_usa_quadbin15_v1_yearly_v2_tileset",
    type_=pdkc.MapType.TILESET,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_layer_quadbin_tileset.html"))
