"""
GeoJsonLayer
===========

Property values in Vancouver, Canada, adapted from the deck.gl example pages.
"""


import math

import pandas as pd
import pydeck as pdk

# Load in the JSON data
DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json"
json = pd.read_json(DATA_URL)
df = pd.DataFrame()

# Custom color scale
COLOR_RANGE = [
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38],
]

BREAKS = [-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2]


def color_scale(val):
    for i, b in enumerate(BREAKS):
        if val < b:
            return COLOR_RANGE[i]
    return COLOR_RANGE[i]


def calculate_elevation(val):
    return math.sqrt(val) * 10


# Parse the geometry out in Pandas
df["coordinates"] = json["features"].apply(lambda row: row["geometry"]["coordinates"])
df["valuePerSqm"] = json["features"].apply(lambda row: row["properties"]["valuePerSqm"])
df["growth"] = json["features"].apply(lambda row: row["properties"]["growth"])
df["elevation"] = json["features"].apply(lambda row: calculate_elevation(row["properties"]["valuePerSqm"]))
df["fill_color"] = json["features"].apply(lambda row: color_scale(row["properties"]["growth"]))

# Add sunlight shadow to the polygons
sunlight = {
    "@@type": "_SunLight",
    "timestamp": 1564696800000,  # Date.UTC(2019, 7, 1, 22),
    "color": [255, 255, 255],
    "intensity": 1.0,
    "_shadow": True,
}

ambient_light = {"@@type": "AmbientLight", "color": [255, 255, 255], "intensity": 1.0}

lighting_effect = {
    "@@type": "LightingEffect",
    "shadowColor": [0, 0, 0, 0.5],
    "ambientLight": ambient_light,
    "directionalLights": [sunlight],
}

view_state = pdk.ViewState(
    **{"latitude": 49.254, "longitude": -123.13, "zoom": 11, "maxZoom": 16, "pitch": 45, "bearing": 0}
)

LAND_COVER = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]]

polygon_layer = pdk.Layer(
    "PolygonLayer",
    LAND_COVER,
    stroked=False,
    # processes the data as a flat longitude-latitude pair
    get_polygon="-",
    get_fill_color=[0, 0, 0, 20],
)

polygon_layer = pdk.Layer(
    "PolygonLayer",
    df,
    id="geojson",
    opacity=0.8,
    stroked=False,
    get_polygon="coordinates",
    filled=True,
    extruded=True,
    wireframe=True,
    get_elevation="elevation",
    get_fill_color="fill_color",
    get_line_color=[255, 255, 255],
    auto_highlight=True,
    pickable=True,
)

tooltip = {"html": "<b>Value per Square Meter:</b> {valuePerSqm} <br /><b>Growth rate:</b> {growth}"}

r = pdk.Deck(
    polygon_layer,
    initial_view_state=view_state,
    effects=[lighting_effect],
    map_style=pdk.map_styles.LIGHT,
    tooltip=tooltip,
)
r.to_html("polygon_layer.html")
