"""
CartoLayer
==========

Render cloud data in Quadbin grid from a query.
"""
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, notify_error
from pydeck_carto.layer import MapType, CartoConnection, GeoColumnType

carto_auth = CartoAuth.from_oauth()

register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="select * from carto-demo-data.demo_tables"
    ".derived_spatialfeatures_usa_quadbin15_v1_yearly_v2",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    geo_column=GeoColumnType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pickable=True,
    on_data_error=notify_error(),
)

view_state = pdk.ViewState(latitude=44, longitude=-122, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_quadbin_query.html", open_browser=True)
