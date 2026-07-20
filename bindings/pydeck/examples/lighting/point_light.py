"""PointLight
============

Illuminate geometry from a fixed geographic position.
"""

import pydeck as pdk

columns = [
    {"position": [-1.3, -0.8], "elevation": 70000, "color": [255, 99, 71]},
    {"position": [0, 0.2], "elevation": 120000, "color": [64, 224, 208]},
    {"position": [1.3, -0.4], "elevation": 90000, "color": [255, 215, 0]},
]
ground = [[[-2.7, -1.8], [2.7, -1.8], [2.7, 1.8], [-2.7, 1.8]]]

layers = [
    pdk.Layer(
        "PolygonLayer",
        data=ground,
        get_polygon="-",
        get_fill_color=[45, 52, 64],
        material=True,
    ),
    pdk.Layer(
        "ColumnLayer",
        data=columns,
        get_position="position",
        get_elevation="elevation",
        get_fill_color="color",
        radius=55000,
        disk_resolution=6,
        extruded=True,
        material=True,
    ),
]
initial_view_state = pdk.ViewState(latitude=0, longitude=0, zoom=5.8, pitch=48, bearing=-20)

light = pdk.Effect("PointLight", color=[255, 150, 90], intensity=3.0, position=[-1.5, -1, 180000])
lighting = pdk.Effect("LightingEffect", gallery_light=light)
deck = pdk.Deck(
    layers=layers,
    effects=[lighting],
    initial_view_state=initial_view_state,
    map_provider=None,
    show_error=True,
)
deck.to_html("point_light.html", css_background_color="#111827")
