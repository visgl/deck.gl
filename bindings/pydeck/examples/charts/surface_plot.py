"""
Surface Plot
============

A 3D surface plot on an OrbitView.

The surface is a heightfield of quads drawn with a SolidPolygonLayer, colored on a diverging ramp
by height. Drag to orbit, scroll to zoom.
"""

import numpy as np
import pydeck as pdk

AXIS = [156, 163, 175]
TEXT = [209, 213, 219]

# z = f(x, y) sampled on a regular grid
N = 32
xs = np.linspace(-30, 30, N + 1)
X, Y = np.meshgrid(xs, xs)
Z = 12 * np.sin(X / 8) * np.cos(Y / 8)
Z_MIN, Z_MAX = -12, 12

# Diverging color ramp: blue (low) -> neutral (zero) -> red (high)
RAMP_STOPS = np.array([[57, 135, 229], [56, 56, 53], [230, 103, 103]])


def color_for(z):
    t = (z - Z_MIN) / (Z_MAX - Z_MIN)
    return [int(np.interp(t, [0, 0.5, 1], RAMP_STOPS[:, c])) for c in range(3)]


cells = []
for i in range(N):
    for j in range(N):
        corners = [(i, j), (i, j + 1), (i + 1, j + 1), (i + 1, j)]
        polygon = [[round(float(X[a, b]), 1), round(float(Y[a, b]), 1), round(float(Z[a, b]), 2)] for a, b in corners]
        z_mean = float(np.mean([Z[a, b] for a, b in corners]))
        cells.append({"polygon": polygon, "value": round(z_mean, 2), "color": color_for(z_mean)})

# Axis lines along the visible front and right edges below the surface, labelled at their midpoints
axes = [
    {"source": [-32, -32, -14], "target": [32, -32, -14]},  # x
    {"source": [32, -32, -14], "target": [32, 32, -14]},  # y
    {"source": [-32, -32, -14], "target": [-32, -32, 14]},  # z
]
axis_labels = [
    {"position": [0, -36, -14], "text": "x"},
    {"position": [36, 0, -14], "text": "y"},
    {"position": [-32, -32, 16], "text": "z"},
]

layers = [
    pdk.Layer(
        "SolidPolygonLayer",
        id="surface",
        data=cells,
        get_polygon="polygon",
        get_fill_color="color",
        pickable=True,
        auto_highlight=True,
    ),
    pdk.Layer(
        "LineLayer",
        id="axes",
        data=axes,
        get_source_position="source",
        get_target_position="target",
        get_color=AXIS,
        get_width=2,
        width_units=pdk.types.String("pixels"),
    ),
    pdk.Layer(
        "TextLayer",
        id="axis-labels",
        data=axis_labels,
        get_position="position",
        get_text="text",
        get_size=14,
        get_color=TEXT,
    ),
]

view = pdk.View(type="OrbitView", controller=True, orbit_axis="Z")
view_state = pdk.ViewState(target=[0, 0, 0], zoom=2.4, rotation_x=35, rotation_orbit=-35, min_zoom=1, max_zoom=5)

deck = pdk.Deck(
    layers=layers,
    views=[view],
    initial_view_state=view_state,
    map_provider=None,
    tooltip={"text": "z = {value}"},
)

deck.to_html("surface_plot.html", css_background_color="#111827")
