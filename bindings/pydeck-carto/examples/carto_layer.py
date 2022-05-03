"""
CartoLayer
==========

Render cloud data with a session token.
"""

import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials

# Initialize
register_carto_layer()

credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM cartobq.public_account.populated_places",
    type_=pdk.types.String("query"),
    connection=pdk.types.String("bigquery"),
    credentials=credentials,
    get_fill_color=[238, 77, 90],
    pointRadiusMinPixels=2.5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state={
    "latitude": 0,
    "longitude": 0,
    "zoom": 1})

r.to_html("carto_layer.html")
