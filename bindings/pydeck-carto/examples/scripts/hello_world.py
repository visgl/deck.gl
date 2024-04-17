"""
CartoLayer - Hello World
========================

https://docs.carto.com/deck-gl/examples/basic-examples/hello-world/
"""

import pydeck as pdk
import pydeck_carto as pdkc

pdkc.register_layers()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM cartobq.public_account.populated_places",
    type_=pdkc.MapType.QUERY,
    connection=pdk.types.String("bqconnection"),
    credentials={
        "apiBaseUrl": "https://gcp-us-east1.api.carto.com",
        "accessToken": "eyJhbGciOiJIUzI1NiJ9"
        ".eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiIwMGQ1NmFiMyJ9"
        ".zqsprFkxiafKXQ91PDB8845nVeWGVnuLg22v49J3Wiw",
    },
    get_fill_color=[238, 77, 90],
    point_radius_min_pixels=2.5,
)

view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "hello_world.html"))
