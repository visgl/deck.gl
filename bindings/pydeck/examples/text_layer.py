import pydeck as pdk
import pandas as pd

TEXT_LAYER_DATA = ('https://raw.githubusercontent.com/uber-common/'
                   'deck.gl-data/master/website/bart-stations.json')
df = pd.read_json(TEXT_LAYER_DATA)

# Define a layer to display on a map
layer = pdk.Layer(
    'TextLayer',
    df,
    pickable=True,
    get_position='coordinates',
    get_text='name',
    get_size=32,
    get_angle=0,
    get_text_anchor='middle',
    get_alignment_baseline='center')

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
r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\n{address}"})
r.to_html('text_layer.html')
