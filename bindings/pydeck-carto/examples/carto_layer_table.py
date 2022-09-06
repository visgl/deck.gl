"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth

from pydeck_carto.layer import CartoConnection, MapType, CartoColorBins

register_carto_layer()

carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.airports",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=CartoColorBins(attr="pct_higher_ed", domain=[0, 20, 30, 40, 50, 60, 70],
                                  colors="PinkYl"),
    pointRadiusMinPixels=2)
view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_table.html", open_browser=True)
