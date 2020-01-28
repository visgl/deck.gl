import pandas as pd
import pydeck

# Data source: New Mexico livestock data from 2006 from FAOSTAT
"""
Map of livestock locations in the state of New Mexico
"""

CATTLE_DATA = (
    "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/nm_cattle.csv"
)
POULTRY_DATA = (
    "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/nm_chickens.csv"
)


HEADER = ["lng", "lat", "weight"]
cattle_df = pd.read_csv(CATTLE_DATA, header=None)
poultry_df = pd.read_csv(POULTRY_DATA, header=None)

cattle_df.columns = HEADER
poultry_df.columns = HEADER


view = pydeck.data_utils.compute_view(cattle_df[["lng", "lat"]])

p75, p90, p99 = cattle_df["weight"].quantile([0.75, 0.9, 0.99])

STROKE_WIDTH = 5

CONTOURS_0 = [
    {"threshold": p75, "color": [0, 238, 224], "strokeWidth": STROKE_WIDTH},
    {"threshold": p90, "color": [0, 180, 240], "strokeWidth": STROKE_WIDTH},
    {"threshold": p99, "color": [0, 0, 240], "strokeWidth": STROKE_WIDTH},
]

p75, p90, p99 = poultry_df["weight"].quantile([0.75, 0.9, 0.99])

CONTOURS_1 = [
    {
        "threshold": p75,
        "color": [245, 245, 0],
        "strokeWidth": STROKE_WIDTH,
        "zIndex": 1,
    },
    {
        "threshold": p99,
        "color": [247, 150, 0],
        "strokeWidth": STROKE_WIDTH,
        "zIndex": 10,
    },
]


# in meters
CELL_SIZE = 3000

cattle = pydeck.Layer(
    "ContourLayer",
    data=cattle_df,
    get_position=["lng", "lat"],
    contours=CONTOURS_0,
    cell_size=CELL_SIZE,
    aggregation='"MEAN"',
    get_weight="weight",
    pickable=True,
)

poultry = pydeck.Layer(
    "ContourLayer",
    data=poultry_df,
    get_position=["lng", "lat"],
    contours=CONTOURS_1,
    cell_size=CELL_SIZE,
    aggregation='"MEAN"',
    get_weight="weight",
    pickable=True,
)


r = pydeck.Deck(
    layers=[cattle, poultry],
    initial_view_state=view,
    map_style="mapbox://styles/mapbox/satellite-v9",
    tooltip={
        "text": "Concentration of cattle in blue, concentration of poultry in orange"
    },
)

r.to_html("contour_layer.html", notebook_display=False)
