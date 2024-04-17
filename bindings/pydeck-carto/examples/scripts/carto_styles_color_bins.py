"""
CartoLayer
==========

Render cloud data with color bins style.
"""
import pydeck as pdk
import pydeck_carto as pdkc
from carto_auth import CartoAuth
from os.path import join, dirname

carto_auth = CartoAuth.from_oauth()

pdkc.register_layers()

data = pdkc.sources.vector_query_source(
    access_token=carto_auth.get_access_token(),
    api_base_url=carto_auth.get_api_base_url(),
    connection_name="carto_dw",
    sql_query="SELECT geom, pct_higher_ed "
    "FROM `cartobq.public_account.higher_edu_by_county`",
)

layer = pdk.Layer(
    "VectorTileLayer",
    data=data,
    get_fill_color=pdkc.styles.color_bins(
        "pct_higher_ed", [0, 20, 30, 40, 50, 60, 70], "PinkYl"
    ),
    get_line_color=[0, 0, 0, 100],
    line_width_min_pixels=0.5,
    pickable=True,
)

view_state = pdk.ViewState(latitude=38, longitude=-98, zoom=3)

r = pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
r.to_html(join(dirname(__file__), "carto_styles_color_bins.html"))
