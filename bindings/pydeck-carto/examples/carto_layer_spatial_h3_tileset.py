"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials

from pydeck_carto.layer import MapType, GeoColumType, CartoConnection

register_carto_layer()
credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.derived_spatialfeatures_usa_h3res8_v1_yearly_v2_tileset",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=credentials,
    get_fill_color=[200, 0, 80],
    pickable=True,
    pointRadiusMinPixels=2)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html('outputs/carto_layer_h3_tileset.html', open_browser=True)
