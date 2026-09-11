"""
Scatter Plot
============

A non-geospatial scatter plot rendered with an OrthographicView.

Axes, gridlines, tick labels and the legend are ordinary deck.gl layers (LineLayer, TextLayer and
ScatterplotLayer) positioned in plain x/y coordinates. ``flip_y=False`` puts the origin in the
bottom-left corner and ``map_provider=None`` disables the basemap.
"""

import numpy as np
import pydeck as pdk
from pydeck.types import String

SURFACE = [17, 24, 39]
GRID = [55, 65, 81]
AXIS = [156, 163, 175]
TEXT = [209, 213, 219]
SERIES = {"Group A": [57, 135, 229], "Group B": [217, 89, 38], "Group C": [25, 158, 112]}

# Synthetic data: three groups with different offsets and a common trend
rng = np.random.default_rng(7)
points = []
for i, (group, color) in enumerate(SERIES.items()):
    xs = rng.uniform(5, 95, 120)
    ys = np.clip(0.35 * xs + 20 * i + rng.normal(0, 7, 120), 2, 98)
    points.extend(
        {"x": round(float(x), 2), "y": round(float(y), 2), "group": group, "color": color} for x, y in zip(xs, ys)
    )

ticks = list(range(0, 101, 20))
grid_lines = [{"source": [t, 0], "target": [t, 100]} for t in ticks] + [
    {"source": [0, t], "target": [100, t]} for t in ticks
]
axes = [{"source": [0, 0], "target": [100, 0]}, {"source": [0, 0], "target": [0, 100]}]

# Per-row text anchoring keeps x ticks below the axis and y ticks left of it
labels = [{"position": [t, -3], "text": str(t), "anchor": "middle", "baseline": "top", "angle": 0} for t in ticks]
labels += [{"position": [-3, t], "text": str(t), "anchor": "end", "baseline": "center", "angle": 0} for t in ticks]
labels += [
    {"position": [50, -10], "text": "x value", "anchor": "middle", "baseline": "top", "angle": 0},
    {"position": [-11, 50], "text": "y value", "anchor": "middle", "baseline": "bottom", "angle": 90},
]

# Legend: a color swatch and a label per group, above the plot area
legend_swatches = [{"position": [3, 112 - 5 * i], "color": color} for i, color in enumerate(SERIES.values())]
labels += [
    {"position": [6, 112 - 5 * i], "text": group, "anchor": "start", "baseline": "center", "angle": 0}
    for i, group in enumerate(SERIES)
]

layers = [
    pdk.Layer(
        "LineLayer",
        id="grid",
        data=grid_lines,
        get_source_position="source",
        get_target_position="target",
        get_color=GRID,
        get_width=1,
        width_units=String("pixels"),
    ),
    pdk.Layer(
        "LineLayer",
        id="axes",
        data=axes,
        get_source_position="source",
        get_target_position="target",
        get_color=AXIS,
        get_width=2,
        width_units=String("pixels"),
    ),
    pdk.Layer(
        "ScatterplotLayer",
        id="points",
        data=points,
        get_position=["x", "y"],
        get_fill_color="color",
        get_radius=5,
        radius_units=String("pixels"),
        stroked=True,
        get_line_color=SURFACE,
        line_width_min_pixels=1,
        pickable=True,
        auto_highlight=True,
    ),
    pdk.Layer(
        "ScatterplotLayer",
        id="legend-swatches",
        data=legend_swatches,
        get_position="position",
        get_fill_color="color",
        get_radius=4,
        radius_units=String("pixels"),
    ),
    pdk.Layer(
        "TextLayer",
        id="labels",
        data=labels,
        get_position="position",
        get_text="text",
        get_size=12,
        get_color=TEXT,
        get_text_anchor="anchor",
        get_alignment_baseline="baseline",
        get_angle="angle",
    ),
]

# A y-up orthographic camera looking at the center of the 100 x 100 plot area
view = pdk.View(type="OrthographicView", controller=True, flip_y=False)
view_state = pdk.ViewState(target=[50, 50, 0], zoom=2.2, min_zoom=1, max_zoom=6)

deck = pdk.Deck(
    layers=layers,
    views=[view],
    initial_view_state=view_state,
    map_provider=None,
    tooltip={"text": "{group}: ({x}, {y})"},
)

deck.to_html("scatter_plot.html", css_background_color="#111827")
