"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, color_bins

from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()

carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.spatialfeatures_esp_quadgrid15",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=color_bins(attr="population", domain=[100, 1000, 5000, 25000, 40000],
                              colors="Teal"),
    pointRadiusMinPixels=2)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5.5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_styles_color_bins.html", open_browser=True)
