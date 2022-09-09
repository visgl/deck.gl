"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, color_continuous

from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()

carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name carto-demo-data.demo_tables.airports",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=color_continuous(attr="population", domain=[0, 10000],
                              colors="RedOr"),
    pointRadiusMinPixels=2)

# view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_styles_color_continuous.html", open_browser=True)
