"""
CartoLayer - Hello World
========================

https://docs.carto.com/deck-gl/examples/basic-examples/hello-world/
"""

import pydeck as pdk
from pydeck_carto import register_carto_layer

# Initialize
register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM cartobq.public_account.populated_places",
    type_=pdk.types.String("query"),
    connection=pdk.types.String("bqconn"),
    credentials={
        "apiBaseUrl": "https://gcp-us-east1.api.carto.com",
        "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfbHFlM3p3Z3UiLCJqdGkiOiI1YjI0OWE2ZCJ9.Y7zB30NJFzq5fPv8W5nkoH5lPXFWQP0uywDtqUg8y8c"},
    get_fill_color=[238, 77, 90],
    pointRadiusMinPixels=2.5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state={
    "latitude": 0,
    "longitude": 0,
    "zoom": 1})

r.to_html("hello_world.html")
