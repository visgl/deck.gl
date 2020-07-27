"""
PointCloudLayer
===============
A subset of a Creative Commons-licensed laser-scanned point cloud of Choshi-Otaki Falls in Aomori, Japan.

The full data set is viewable here:
https://sketchfab.com/3d-models/choshi-otaki-falls-oirase-valley-aomori-ea1ef9e7f82f418ea0776ceb6894ebd1
"""

import pydeck
import pandas as pd


DATA_URL = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/small_waterfall.csv"
df = pd.read_csv(DATA_URL)

target = [df.x.mean(), df.y.mean(), df.z.mean()]

point_cloud_layer = pydeck.Layer(
    "PointCloudLayer",
    data=DATA_URL,
    get_position=["x", "y", "z"],
    get_color=["r", "g", "b"],
    get_normal=[0, 0, 15],
    auto_highlight=True,
    pickable=True,
    point_size=3,
)

view_state = pydeck.ViewState(target=target, controller=True, rotation_x=15, rotation_orbit=30, zoom=5.3)
view = pydeck.View(type="OrbitView", controller=True)

r = pydeck.Deck(point_cloud_layer, initial_view_state=view_state, views=[view])
r.to_html("point_cloud_layer.html", css_background_color="#add8e6")
