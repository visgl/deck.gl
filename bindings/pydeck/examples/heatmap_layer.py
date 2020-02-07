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

COLOR_BREWER_BLUE_SCALE = [
    [240, 249, 232],
    [204, 235, 197],
    [168, 221, 181],
    [123, 204, 196],
    [67, 162, 202],
    [8, 104, 172],
]


view = pydeck.data_utils.compute_view(cattle_df[["lng", "lat"]])
view.zoom = 6

cattle = pydeck.Layer(
    "HeatmapLayer",
    data=cattle_df,
    opacity=0.9,
    get_position=["lng", "lat"],
    aggregation='"MEAN"',
    color_range=COLOR_BREWER_BLUE_SCALE,
    threshold=1,
    get_weight="weight",
    pickable=True,
)

poultry = pydeck.Layer(
    "HeatmapLayer",
    data=poultry_df,
    opacity=0.9,
    get_position=["lng", "lat"],
    threshold=0.75,
    aggregation='"MEAN"',
    get_weight="weight",
    pickable=True,
)


r = pydeck.Deck(
    layers=[cattle, poultry],
    initial_view_state=view,
    map_style="mapbox://styles/mapbox/dark-v9",
    tooltip={
        "text": "Concentration of cattle in blue, concentration of poultry in orange"
    },
)

r.to_html("heatmap_layer.html", notebook_display=False)
