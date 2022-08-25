"""
CartoLayer
==========

Render cloud data with a session token.
"""
import subprocess

import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials

# Initialize
from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()

credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.pointsofinterest_esp",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=credentials,
    get_fill_color=[200, 0, 80],
    stroked=False,
    pickable=True,
    pointRadiusMinPixels=2)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)

layer_rendered = "outputs/carto_layer_tileset.html"
r.to_html(layer_rendered)

subprocess.call(['open', layer_rendered])
