"""
Widgets
=======

Demonstrates deck.gl UI widgets in pydeck.

This example shows several built-in widgets for map navigation and interaction:
- ZoomWidget and CompassWidget for camera control
- FullscreenWidget and ScreenshotWidget for utility
- ScaleWidget for displaying map scale
- StatsWidget for rendering performance stats
"""

import pydeck as pdk

# Data sources
COUNTRIES = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson"
AIR_PORTS = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson"

# Initial view centered on London
view_state = pdk.ViewState(latitude=51.47, longitude=0.45, zoom=4, bearing=0, pitch=30)

# Layers
countries_layer = pdk.Layer(
    "GeoJsonLayer",
    id="base-map",
    data=COUNTRIES,
    stroked=True,
    filled=True,
    line_width_min_pixels=2,
    opacity=0.4,
    get_line_color=[60, 60, 60],
    get_fill_color=[200, 200, 200],
)

airports_layer = pdk.Layer(
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
)

# Widgets for map navigation and interaction
widgets = [
    pdk.Widget("ZoomWidget"),
    pdk.Widget("CompassWidget"),
    pdk.Widget("FullscreenWidget"),
    pdk.Widget("ScreenshotWidget"),
    pdk.Widget("ScaleWidget", placement="bottom-right"),
    pdk.Widget("StatsWidget", statsType="luma", placement="bottom-left"),
]

deck = pdk.Deck(
    layers=[countries_layer, airports_layer],
    initial_view_state=view_state,
    widgets=widgets,
    tooltip={"text": "{properties.name} ({properties.abbrev})\n{properties.type}"},
)

deck.to_html("widgets.html")
