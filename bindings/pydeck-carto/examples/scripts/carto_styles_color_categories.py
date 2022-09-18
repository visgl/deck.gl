"""
CartoLayer
==========

Render cloud data with color categories style.
"""
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, notify_error
from pydeck_carto.layer import MapType, CartoConnection
from pydeck_carto.styles import color_categories

carto_auth = CartoAuth.from_oauth()

register_carto_layer()

layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, landuse_type FROM `cartobq.public_account.wburg_parcels`",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=color_categories(
        "landuse_type",
        [
            "Multi-Family Walk-Up Buildings",
            "Multi-Family Elevator Buildings",
            "Mixed Residential And Commercial Buildings",
            "Parking Facilities",
            "1 and 2 Family Buildings",
            "Commercial and Office Buildings",
            "Vacant Land",
            "Public Facilities and Institutions",
            "Transportation and Utility",
            "Open Space and Outdoor Recreation",
            "Industrial and Manufacturing",
        ],
        "Bold",
    ),
    get_line_color=[0, 0, 0, 100],
    line_width_min_pixels=0.5,
    pickable=True,
    on_data_error=notify_error(),
)

view_state = pdk.ViewState(latitude=40.715, longitude=-73.959, zoom=14)

r = pdk.Deck(layer, map_style=pdk.map_styles.LIGHT, initial_view_state=view_state)
r.to_html("carto_styles_color_categories.html", open_browser=True)
