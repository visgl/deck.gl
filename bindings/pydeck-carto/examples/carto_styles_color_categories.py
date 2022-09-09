"""
CartoLayer
==========

Render cloud data with a session token.
"""
import pydeck as pdk
from pydeck_carto import register_carto_layer, CartoAuth, color_categories

from pydeck_carto.layer import CartoConnection, MapType

register_carto_layer()

carto_auth = CartoAuth.from_file("./carto_credentials.json")

layer = pdk.Layer(
    "CartoLayer",
    data="carto-demo-data.demo_tilesets.pointsofinterest_france",
    type_=MapType.TILESET,
    connection=CartoConnection.CARTO_DW,
    credentials=carto_auth.get_layer_credentials(),
    get_fill_color=color_categories(attr="amenity",
                                    domain=[
                                        "restaurant", "bench", "bicycle_parking", "recycling",
                                        "waste_basket", "parking",
                                        "post_box", "school", "toilets", "pharmacy"],
                                    colors="PurpOr"),
    pickable=True,
    pointRadiusMinPixels=3)

view_state = pdk.ViewState(latitude=46.4, longitude=2, zoom=6)


r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html("outputs/carto_styles_color_categories.html", open_browser=True)
