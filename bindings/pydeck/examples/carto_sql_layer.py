import pydeck as pdk

"""
CartoSQLLayer
=============

Integration with Carto (https://carto.com).

Any urban area with greater than 100,000 in green.
"""

layer = pdk.Layer(
    "CartoSQLLayer",
    data="SELECT the_geom_webmercator, gn_pop FROM populated_places",
    credentials={"username": "public", "apiKey": "default_public"},
    get_fill_color="properties.gn_pop > 100000 ? [102, 194, 165, 150] : [141, 160, 203, 150]",
    point_radius_min_pixels=5,
)
r = pdk.Deck(layer)
r.to_html("carto_sql_layer.html")
