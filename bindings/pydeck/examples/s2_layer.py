import pydeck as pdk
import pandas as pd

S2_LAYER_DATA = ('https://raw.githubusercontent.com/uber-common/'
                 'deck.gl-data/master/website/sf.s2cells.json')
df = pd.read_json(S2_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    'S2Layer',
    df,
    pickable=True,
    wireframe=False,
    filled=True,
    extruded=True,
    elevation_scale=1000,
    getS2Token='token',
    get_fill_color='[value * 255, (1 - value) * 255, (1 - value) * 128]',
    get_elevation='value',
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
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{token} value: {value}"})
r.to_html('s2_layer.html')
