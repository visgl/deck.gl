"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials

from pydeck_carto.layer import MapType, CartoConnection

register_carto_layer()
credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=credentials,
    get_fill_color=[238, 77, 90],
    pickable=True,
    pointRadiusMinPixels=2.5)
view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_query.html", open_browser=True)
