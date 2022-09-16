"""
CartoLayer
==========

Render cloud data in Quadbin grid from a tileset.
"""
import pydeck as pdk

from carto_auth import CartoAuth
from carto_pydeck import register_carto_layer, get_layer_credentials, notify_error
from carto_pydeck.layer import MapType, CartoConnection

register_carto_layer()

carto_auth = CartoAuth.from_oauth()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets"
    ".derived_spatialfeatures_usa_quadbin15_v1_yearly_v2_tileset",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=[200, 0, 80],
    pickable=True,
    on_data_error=notify_error(),
)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_quadbin_tileset.html", open_browser=True)
