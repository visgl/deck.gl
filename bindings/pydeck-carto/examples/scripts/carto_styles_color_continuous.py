"""
CartoLayer
==========

Render cloud data with color continuous style.
"""
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials
from pydeck_carto.layer import MapType, CartoConnection
from pydeck_carto.styles import color_continuous

carto_auth = CartoAuth.from_oauth()

register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, value FROM cartobq.public_account.temps",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=color_continuous("value", [70, 75, 80, 85, 90, 95, 100], "Peach"),
    point_radius_min_pixels=2.5,
    pickable=True,
)
view_state = pdk.ViewState(latitude=34, longitude=-98, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_styles_color_continuous.html", open_browser=True)
