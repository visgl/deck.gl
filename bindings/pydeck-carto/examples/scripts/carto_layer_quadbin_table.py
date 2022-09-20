"""
CartoLayer
==========

Render cloud data in Quadbin grid from a table.
"""
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, get_error_notifier
from pydeck_carto.layer import MapType, CartoConnection, GeoColumnType

carto_auth = CartoAuth.from_oauth()

register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tables"
    ".derived_spatialfeatures_esp_quadbin15_v1_yearly_v2",
    type_=MapType.TABLE,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    geo_column=GeoColumnType.QUADBIN,
    get_fill_color=[200, 0, 80],
    pickable=True,
    on_data_error=get_error_notifier(),
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("carto_layer_quadbin_table.html", open_browser=True)
