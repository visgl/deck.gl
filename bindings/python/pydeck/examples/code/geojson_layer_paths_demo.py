"""An example of the GeoJSON layer

The original deck.gl example is here:
https://deck.gl/#/examples/core-layers/geojson-layer-paths

The demo relies on integration with d3.js scales,
which aren't used in pydeck, and interactivity

Instead, this example uses data for blue whale migratory habits and
is viewable here: https://github.com/ajduberstein/migration_data

Note that this is not meant to be a scientific analysis but rather
a demonstration of the pydeck library
"""
import pydeck
import pandas as pd

# pydeck can load data from a Pandas data frame or from a URL
WHALE_LOCATIONS = 'https://raw.githubusercontent.com/ajduberstein/migration_data/master/whales.csv'
df = pd.read_csv(WHALE_LOCATIONS)[['timestamp', 'ind_ident', 'lat1', 'lng1']]

viewport = pydeck.data_utils.compute_view(df['lat1', 'lng1'])

GEOJSON_PATH_URL = 'https://raw.githubusercontent.com/ajduberstein/migration_data/master/whales.csv'

geojson_layer = pydeck.Layer(
    'GeoJsonLayer',
    GEOJSON_PATH_URL,
    stroked=False,
    filled=True,
    extruded=True,
    line_width_scale=20,
    line_width_min_pixels=2,
    get_fill_colors=[160, 160, 180, 200],
)

scatterplot = pydeck.Layer(
    'ScatterplotLayer',
    GEOJSON_PATH_URL,
    stroked=False,
    filled=True,
    extruded=True,
    pickable=True,
    auto_highlight=True,
    radius=10000,
    get_fill_colors=[0, 160, 180, 200])

r = pydeck.Deck(
    layers=[geojson_layer],
    initial_view_state=viewport)

r.to_html()
