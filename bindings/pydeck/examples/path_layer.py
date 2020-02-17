import pydeck
import pandas as pd


DATA_URL = "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart-lines.json"
df = pd.read_json(DATA_URL)

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


df['color'] = df['color'].apply(hex_to_rgb)


view_state = pydeck.ViewState(
    latitude=37.782556,
    longitude=-122.3484867,
    zoom=10
)

layer = pydeck.Layer(
    type='PathLayer',
    data=df,
    pickable=True,
    get_color='color',
    width_scale=20,
    width_min_pixels=2,
    get_path='path',
    get_width=5
)

r = pydeck.Deck(layers=[layer], initial_view_state=view_state, tooltip={'text': '{name}'})
r.to_html("path_layer.html", notebook_display=False)
