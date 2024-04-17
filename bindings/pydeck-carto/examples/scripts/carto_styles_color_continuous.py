"""
CartoLayer
==========

Render cloud data with color continuous style.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, value FROM cartobq.public_account.temps",
    type_=pdkc.MapType.QUERY,
    connection=pdkc.CartoConnection.CARTO_DW,
    credentials=pdkc.get_layer_credentials(carto_auth),
    get_fill_color=pdkc.styles.color_continuous(
        "value", [70, 75, 80, 85, 90, 95, 100], "Peach"
    ),
    point_radius_min_pixels=2.5,
    pickable=True,
)
view_state = pdk.ViewState(latitude=34, longitude=-98, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_styles_color_continuous.html"))
