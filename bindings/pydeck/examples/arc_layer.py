import pydeck
import pandas as pd

# Map of commutes to work within downtown San Francisco, from the US Census LODES data set
DATA_URL = "https://raw.githubusercontent.com/ajduberstein/sf_public_data/master/bay_area_commute_routes.csv"
DOWNTOWN_BOUNDING_BOX = [
    -122.43135291617365,
    37.766492914983864,
    -122.38706428091974,
    37.80583561830737,
]


def in_bounding_box(point):
    lng, lat = point
    in_lng_bounds = DOWNTOWN_BOUNDING_BOX[0] <= lng <= DOWNTOWN_BOUNDING_BOX[2]
    in_lat_bounds = DOWNTOWN_BOUNDING_BOX[1] <= lat <= DOWNTOWN_BOUNDING_BOX[3]
    return in_lng_bounds and in_lat_bounds


df = pd.read_csv(DATA_URL)
# Filter to bounding box
df = df[df[["lng_w", "lat_w"]].apply(lambda row: in_bounding_box(row), axis=1)]

GREEN_RGB = [0, 255, 0, 40]
RED_RGB = [240, 100, 0, 40]

arc_layer = pydeck.Layer(
    "ArcLayer",
    data=df,
    get_width="S000 * 2",
    get_source_position=["lng_h", "lat_h"],
    get_target_position=["lng_w", "lat_w"],
    get_tilt=15,
    get_source_color=RED_RGB,
    get_target_color=GREEN_RGB,
    pickable=True,
    auto_highlight=True
)

view_state = pydeck.ViewState(
    latitude=37.7576171, longitude=-122.5776844, bearing=45, pitch=50, zoom=8,
)


TOOLTIP_TEXT = {
    "html": "{S000} jobs <br /> Home of commuter in red; work location in green"
}
r = pydeck.Deck(arc_layer, initial_view_state=view_state, tooltip=TOOLTIP_TEXT)
r.to_html("arc_layer.html", notebook_display=False)
