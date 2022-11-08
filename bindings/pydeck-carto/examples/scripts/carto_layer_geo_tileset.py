"""
CartoLayer
==========

Render cloud data from a tileset.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth

carto_auth = CartoAuth.from_oauth()

pdkc.register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.pointsofinterest_esp",
    type_=pdkc.MapType.TILESET,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    get_fill_color=[200, 0, 80],
    stroked=False,
    point_radius_min_pixels=2,
    pickable=True,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_geo_tileset.html", open_browser=True)
