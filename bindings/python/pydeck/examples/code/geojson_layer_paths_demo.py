"""An example of the GeoJSON layer

The original deck.gl example is here:
https://deck.gl/#/examples/core-layers/geojson-layer-paths

The demo relies on integration with d3.js scales,
which aren't used in pydeck, and interactivity

Instead, this example uses data for blue whale migratory habits.
is viewable here: https://github.com/ajduberstein/migration_data

Note that this is not meant to be a scientific analysis but rather
a demonstration of the pydeck library
"""
import pydeck
import pandas as pd

# pydeck can load data from a Pandas data frame or from a URL
WHALE_LOCATIONS = 'https://raw.githubusercontent.com/ajduberstein/migration_data/master/whales.csv'
df = pd.read_csv(WHALE_LOCATIONS)[['timestamp', 'ind_ident', 'long', 'lat']]
viewport = pydeck.data_utils.compute_view(df[['long', 'lat']])
color_lookup = pydeck.data_utils.assign_random_colors(df['ind_ident'])
df['color'] = df['ind_ident'].apply(lambda x: color_lookup[x])

GEOJSON_PATH_URL = 'https://raw.githubusercontent.com/ajduberstein/migration_data/master/whale_paths.geojson'

geojson_layer = pydeck.Layer(
    'GeoJsonLayer',
    GEOJSON_PATH_URL,
    stroked=False,
    filled=True,
    extruded=True,
    line_width_min_pixels=2,
    line_width_max_pixels=3,
    get_line_color=[160, 160, 180, 10],
)

scatterplot = pydeck.Layer(
    'ScatterplotLayer',
    df,
    stroked=False,
    get_position='[long, lat]',
    filled=True,
    extruded=True,
    pickable=True,
    auto_highlight=True,
    radius_min_pixels=3,
    picking_radius=5,
    radius=1000,
    get_fill_color='color')

r = pydeck.Deck(
    layers=[scatterplot, geojson_layer],
    initial_view_state=viewport,
    height=1000)

r.to_html('whales.html')
