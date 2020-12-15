"""
ColumnLayer
===========

Real estate values for select properties in Taipei. Data is from 2012-2013.
The height of a column indicates increasing price per unit area, and the color indicates distance from a subway stop.

The real estate valuation data set from UC Irvine's Machine Learning repository, viewable here:

https://archive.ics.uci.edu/ml/datasets/Real+estate+valuation+data+set
"""

import pandas as pd
import pydeck as pdk

DATA_URL = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/housing.csv"
df = pd.read_csv(DATA_URL)

view = pdk.data_utils.compute_view(df[["lng", "lat"]])
view.pitch = 75
view.bearing = 60

column_layer = pdk.Layer(
    "ColumnLayer",
    data=df,
    get_position=["lng", "lat"],
    get_elevation="price_per_unit_area",
    elevation_scale=100,
    radius=50,
    get_fill_color=["mrt_distance * 10", "mrt_distance", "mrt_distance * 10", 140],
    pickable=True,
    auto_highlight=True,
)

tooltip = {
    "html": "<b>{mrt_distance}</b> meters away from an MRT station, costs <b>{price_per_unit_area}</b> NTD/sqm",
    "style": {"background": "grey", "color": "white", "font-family": '"Helvetica Neue", Arial', "z-index": "10000"},
}

r = pdk.Deck(
    column_layer,
    initial_view_state=view,
    tooltip=tooltip,
    map_provider="mapbox",
    map_style=pdk.map_styles.SATELLITE,
)

r.to_html("column_layer.html")
