"""
CartoLayer
==========

Render cloud data with query parameters.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, load_carto_credentials
from pydeck_carto.layer import MapType, CartoConnection

register_carto_layer()
credentials = load_carto_credentials("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, event FROM carto-demo-data.demo_tables"
    ".spain_earthquakes where depth > ?",
    query_parameters=[2],
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=credentials,
    get_fill_color=[238, 77, 90],
    pickable=True,
    point_radius_min_pixels=2.5,
)

view_state = pdk.ViewState(latitude=36, longitude=-7.44, zoom=5)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_layer_filtering.html", open_browser=True)
