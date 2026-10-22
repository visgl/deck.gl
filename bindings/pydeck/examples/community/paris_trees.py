"""
Paris Trees
===========

Street trees around the Arc de Triomphe in Paris, drawn as 3D trees with ``TreeLayer``.

``TreeLayer`` is not part of deck.gl. It comes from ``@deck.gl-community/three``, which builds
each tree's trunk and canopy with three.js, and is loaded as an ES module with
``pydeck.settings.register_library``. See "Using deck.gl-community libraries" in the pydeck
documentation.
"""

import pandas as pd
import pydeck as pdk

# Without a version, pydeck loads the release matching its deck.gl version
pdk.settings.register_library(npm="@deck.gl-community/three")

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/les-arbres.csv"

df = pd.read_csv(DATA_URL, sep=";")
df = df.rename(
    columns={"LIBELLEFRANCAIS": "species", "CIRCONFERENCE(CM)": "circumference", "LATITUDE": "lat", "LONGITUDE": "lng"}
)
df = df[df["lng"].between(2.285, 2.32) & df["lat"].between(48.862, 48.88) & df["circumference"].between(10, 500)]

# TreeLayer draws five tree types. Most Paris street trees are broadleaf, drawn as "oak".
TREE_TYPES = {
    "Pin": "pine",
    "Bouleau": "birch",
    "Cerisier à fleurs": "cherry",
    "Poirier à fleurs": "cherry",
    "Palmier": "palm",
}
df["tree_type"] = df["species"].map(TREE_TYPES).fillna("oak")

# The dataset has no heights, so estimate them from the trunk circumference
df["height"] = (df["circumference"] / 10).clip(4, 25).round(1)
df["canopy_radius"] = (df["height"] / 4).clip(1.5, 6).round(1)
# Autumn colors for the most common species. Other trees get TreeLayer's autumn color for their
# tree type. TreeLayer calls its accessors as functions, so the season is a column, not a constant.
AUTUMN_COLORS = {
    "Platane": [200, 150, 60],
    "Marronnier": [175, 80, 30],
    "Tilleul": [230, 190, 50],
    "Erable": [205, 55, 35],
    "Sophora": [160, 175, 60],
}
df["canopy_color"] = df["species"].apply(AUTUMN_COLORS.get)
df["season"] = "autumn"

layer = pdk.Layer(
    "TreeLayer",
    df,
    id="trees",
    get_position=["lng", "lat"],
    get_tree_type="tree_type",
    get_height="height",
    get_canopy_radius="canopy_radius",
    get_canopy_color="canopy_color",
    get_season="season",
    size_scale=1.3,
    pickable=True,
)

view_state = pdk.ViewState(latitude=48.8738, longitude=2.295, zoom=16.5, pitch=60, bearing=30)

r = pdk.Deck(
    layer,
    initial_view_state=view_state,
    map_style=pdk.map_styles.LIGHT,
    tooltip={"text": "{species}\nCircumference: {circumference} cm"},
)
r.to_html("paris_trees.html")
