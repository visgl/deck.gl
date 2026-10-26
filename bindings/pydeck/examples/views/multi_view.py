"""
MultiView
=========

A main map with an inset minimap, laid out with relative view bounds.

deck.gl ``View`` bounds (``x``, ``y``, ``width``, ``height``) accept pixels, percentages, and
CSS ``calc()`` expressions, so responsive multi-view layouts need no JavaScript: the browser
resolves the bounds on every resize. Each view has its own camera via ``initial_view_state``
keyed by view id, and ``clear=True`` on the minimap wipes the pixels of the main view beneath it.
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
        line_width_min_pixels=1,
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

main_view = pdk.View(type="MapView", id="main", controller=True)

# Anchored 16px from the top-right corner; later views draw on top of earlier ones.
minimap = pdk.View(
    type="MapView",
    id="minimap",
    x="calc(100% - 220px)",
    y=16,
    width=204,
    height=140,
    controller=False,
    clear=True,
    clear_color=[17, 24, 39, 255],
)

deck = pdk.Deck(
    layers=layers,
    views=[main_view, minimap],
    initial_view_state={
        "main": {"latitude": 51.47, "longitude": -0.45, "zoom": 6, "pitch": 30},
        "minimap": {"latitude": 51.47, "longitude": -0.45, "zoom": 1},
    },
    map_provider=None,
    tooltip={"text": "{name}"},
)

deck.to_html("multi_view.html", css_background_color="#111827")
