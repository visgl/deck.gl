import pydeck as pdk
import pandas as pd

SCREEN_GRID_LAYER_DATA = ('https://raw.githubusercontent.com/uber-common/'
                          'deck.gl-data/master/website/sf-bike-parking.json')
df = pd.read_json(SCREEN_GRID_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    'ScreenGridLayer',
    df,
    pickable=False,
    opacity=0.8,
    cell_size_pixels=50,
    color_range=[
        [0, 25, 0, 25],
        [0, 85, 0, 85],
        [0, 127, 0, 127],
        [0, 170, 0, 170],
        [0, 190, 0, 190],
        [0, 255, 0, 255]
    ],
    get_position='COORDINATES',
    get_weight='SPACES',
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
r = pdk.Deck(layers=[layer], initial_view_state=view_state)
r.to_html('screengrid_layer.html')
