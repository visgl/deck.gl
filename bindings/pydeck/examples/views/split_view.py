"""
SplitView
=========

Two independently controlled map views side by side, separated by a draggable divider,
using the deck.gl SplitterWidget.

The widget manages the ``views`` prop itself, so the ``Deck`` is created with ``views=None``.
Each pane gets its own camera by keying ``initial_view_state`` on the view ids. Either leaf of
``view_layout`` can itself be another ``view_layout`` dict to nest more splits.
"""

import pydeck as pdk

COUNTRIES = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson"
AIR_PORTS = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson"

layers = [
    pdk.Layer(
        "GeoJsonLayer",
        id="base-map",
        data=COUNTRIES,
        stroked=True,
        filled=True,
        line_width_min_pixels=2,
        opacity=0.4,
        get_line_color=[60, 60, 60],
        get_fill_color=[200, 200, 200],
    ),
    pdk.Layer(
        "GeoJsonLayer",
        id="airports",
        data=AIR_PORTS,
        filled=True,
        point_radius_min_pixels=2,
        point_radius_scale=2000,
        get_point_radius="11 - properties.scalerank",
        get_fill_color=[200, 0, 80, 180],
        pickable=True,
        auto_highlight=True,
    ),
]

# Keys inside view_layout are sent to deck.gl verbatim, so use deck.gl's camelCase names.
splitter = pdk.Widget(
    "SplitterWidget",
    view_layout={
        "orientation": "horizontal",
        "initialSplit": 0.5,
        "views": [
            pdk.View(type="MapView", id="london", controller=True),
            pdk.View(type="MapView", id="new-york", controller=True),
        ],
    },
)

deck = pdk.Deck(
    layers=layers,
    # The SplitterWidget owns the views; leaving this set would disable the widget.
    views=None,
    initial_view_state={
        "london": {"latitude": 51.47, "longitude": -0.45, "zoom": 6},
        "new-york": {"latitude": 40.64, "longitude": -73.78, "zoom": 6},
    },
    widgets=[splitter],
    map_provider=None,
    tooltip={"text": "{name}"},
)

deck.to_html("split_view.html", css_background_color="#111827")
