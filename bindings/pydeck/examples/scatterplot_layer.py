import pydeck as pdk
import pandas as pd
import math

SCATTERPLOT_LAYER_DATA = ('https://raw.githubusercontent.com/uber-common/'
                          'deck.gl-data/master/website/bart-stations.json')
df = pd.read_json(SCATTERPLOT_LAYER_DATA)

# Use pandas to calculate additional data
df["exits_radius"] = df['exits'].apply(
    lambda exits_count: math.sqrt(exits_count)
)

# Define a layer to display on a map
layer = pdk.Layer(
    'ScatterplotLayer',
    df,
    pickable=True,
    opacity=0.8,
    stroked=True,
    filled=True,
    radius_scale=6,
    radius_min_pixels=1,
    radius_max_pixels=100,
    line_width_min_pixels=1,
    get_position='coordinates',
    get_radius= "exits_radius",
    get_fill_color=[255, 140, 0],
    get_line_color=[0, 0, 0],
)

# Set the viewport location
view_state = pdk.ViewState(
    longitude=-122,
    latitude=37,
    zoom=6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.36)

# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\n{address}"})
r.to_html('scatterplot_layer.html')
