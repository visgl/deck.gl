"""
Bar Chart
=========

A bar chart built from rectangles in a SolidPolygonLayer on an OrthographicView.

Bars, gridlines and labels live in plain x/y coordinates. The ``controller`` dict passed to the
view is forwarded to deck.gl's OrthographicController, here clamping panning to the chart area.
"""

import pydeck as pdk
from pydeck.types import String

BLUE = [57, 135, 229]
ORANGE = [217, 89, 38]
GRID = [55, 65, 81]
AXIS = [156, 163, 175]
TEXT = [209, 213, 219]

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
VALUES = [42, 48, 57, 61, 70, 84, 91, 88, 73, 64, 52, 46]  # e.g. monthly ridership, thousands
best = max(VALUES)

bars = []
labels = []
for i, (month, value) in enumerate(zip(MONTHS, VALUES)):
    x0 = 2 + 10 * i
    bars.append(
        {
            "month": month,
            "value": value,
            "polygon": [[x0, 0], [x0 + 6, 0], [x0 + 6, value], [x0, value]],
            "color": ORANGE if value == best else BLUE,
        }
    )
    labels.append({"position": [x0 + 3, -3], "text": month, "anchor": "middle", "baseline": "top"})
    labels.append({"position": [x0 + 3, value + 2], "text": str(value), "anchor": "middle", "baseline": "bottom"})

y_ticks = [0, 25, 50, 75, 100]
grid_lines = [{"source": [0, t], "target": [122, t]} for t in y_ticks if t > 0]
baseline = [{"source": [0, 0], "target": [122, 0]}]
labels += [{"position": [-2, t], "text": str(t), "anchor": "end", "baseline": "center"} for t in y_ticks]

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
        id="baseline",
        data=baseline,
        get_source_position="source",
        get_target_position="target",
        get_color=AXIS,
        get_width=2,
        width_units=String("pixels"),
    ),
    pdk.Layer(
        "SolidPolygonLayer",
        id="bars",
        data=bars,
        get_polygon="polygon",
        get_fill_color="color",
        pickable=True,
        auto_highlight=True,
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
    ),
]

view = pdk.View(
    type="OrthographicView",
    flip_y=False,
    controller={"zoomAxis": "all", "maxBounds": [[-20, -20], [145, 125]]},
)
view_state = pdk.ViewState(target=[61, 50, 0], zoom=2.2, min_zoom=1.5, max_zoom=5)

deck = pdk.Deck(
    layers=layers,
    views=[view],
    initial_view_state=view_state,
    map_provider=None,
    tooltip={"text": "{month}: {value}"},
)

deck.to_html("bar_chart.html", css_background_color="#111827")
