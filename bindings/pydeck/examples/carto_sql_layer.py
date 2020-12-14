import pydeck as pdk


layer = pdk.Layer(
    "CartoSQLLayer",
    data="SELECT the_geom_webmercator, gn_pop FROM populated_places",
    credentials={"username": "public", "apiKey": "default_public"},
    get_line_color=[255, 255, 255],
    get_fill_color="properties.gn_pop > 10000 ? [225, 83, 131] : [255, 221, 154]",
    point_radius_min_pixels=5,
    line_width_min_pixels=1,
    auto_highlight=True,
    pickable=True,
)

r = pdk.Deck(layer)
r.to_html("carto_sql_layer.html")
