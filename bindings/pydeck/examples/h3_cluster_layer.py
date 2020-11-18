"""
H3ClusterLayer
==============

Data grouped by H3 geohash, as an example of one of the geohash schemes supported by pydeck.

This layer joins contiguous regions into the same color. Data format is as follows:

    [
      {
        "mean": 73.333,
        "count": 440,
        "hexIds": [
          "88283082b9fffff",
          "88283082b1fffff",
          "88283082b5fffff",
          "88283082b7fffff",
          "88283082bbfffff",
          "882830876dfffff"
        ]
      },
      {
        "mean": 384.444,
        "count": 3460,
        "hexIds": [
          "8828308281fffff",
          "8828308287fffff",
          "88283082abfffff",
          "88283082a3fffff",
          "8828308289fffff",
          "88283082c7fffff",
          "88283082c3fffff",
          "88283082c1fffff",
          "88283082d5fffff"
        ]
      },
      ...

If you'd simply like to plot a value at an H3 hex ID, see the H3HexagonLayer.

This example is adapted from the deck.gl documentation.
"""

import pydeck as pdk
import pandas as pd

H3_CLUSTER_LAYER_DATA = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3clusters.json"  # noqa

df = pd.read_json(H3_CLUSTER_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    "H3ClusterLayer",
    df,
    pickable=True,
    stroked=True,
    filled=True,
    extruded=False,
    get_hexagons="hexIds",
    get_fill_color="[255, (1 - mean / 500) * 255, 0]",
    get_line_color=[255, 255, 255],
    line_width_min_pixels=2,
)

# Set the viewport location
view_state = pdk.ViewState(latitude=37.7749295, longitude=-122.4194155, zoom=11, bearing=0, pitch=30)


# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "Density: {mean}"})
r.to_html("h3_cluster_layer.html")
