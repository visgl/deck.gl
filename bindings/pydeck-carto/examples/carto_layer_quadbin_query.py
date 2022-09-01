"""
CartoLayer
==========

Render cloud data in Quadbin grid from a query.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth
from pydeck_carto.layer import CartoConnection, MapType, GeoColumnType

register_carto_layer()
carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="select * from carto-demo-data.demo_tables"
    ".derived_spatialfeatures_usa_quadbin15_v1_yearly_v2",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    geo_column=GeoColumnType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pickable=True,
)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_quadbin_query.html", open_browser=True)
