"""
CartoLayer
==========

Catch and notify layer errors.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, get_error_notifier
from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()
carto_auth = CartoAuth.from_oauth()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.wrong_table",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    on_data_error=get_error_notifier(),
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_get_error_notifier.html", open_browser=True)
