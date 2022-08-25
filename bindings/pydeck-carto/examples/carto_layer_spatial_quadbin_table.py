"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials

from pydeck_carto.layer import CartoConnection, MapType, GeoColumType

register_carto_layer()
credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables.derived_spatialfeatures_esp_quadbin15_v1_yearly_v2",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=credentials,
    geo_column=GeoColumType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pointRadiusMinPixels=2)
view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html('carto_layer_spatial_quadbin_table.py', open_browser=True)
