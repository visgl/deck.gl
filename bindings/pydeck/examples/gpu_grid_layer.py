import pydeck as pdk
import pandas as pd

GPUGRID_LAYER_DATA = ('https://raw.githubusercontent.com/uber-common/'
                      'deck.gl-data/master/website/sf-bike-parking.json')
df = pd.read_json(GPUGRID_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    'GPUGridLayer',
    df,
    pickable=True,
    extruded=True,
    cellSize=200,
    elevation_scale=4,
    get_position='COORDINATES',
)

# Set the viewport location
view_state = pdk.ViewState(
    longitude=-122,
    latitude=37,
    zoom=6,
    min_zoom=5,
    max_zoom=15,
    pitch=20.5,
    bearing=-15.36)
# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text":"{position}\nCount: {count}"})
r.to_html('gpu_grid_layer.html')
