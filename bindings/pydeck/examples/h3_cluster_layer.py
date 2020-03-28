import pydeck as pdk
import pandas as pd

H3_CLUSTER_LAYER_DATA = (
    "https://raw.githubusercontent.com/uber-common/"
    "deck.gl-data/master/website/sf.h3clusters.json"
)
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
view_state = pdk.ViewState(
    latitude=37.7749295, longitude=-122.4194155, zoom=11, bearing=0, pitch=30
)


# Render
r = pdk.Deck(
    layers=[layer], initial_view_state=view_state, tooltip={"text": "Density: {mean}"}
)
r.to_html("h3_cluster_layer.html", notebook_display=False)
