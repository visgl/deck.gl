"""
Multi-View Widgets Example
===========================

Demonstrates deck.gl widgets with multiple synchronized views using SplitterWidget.

This example shows:
- Two side-by-side MapView instances
- SplitterWidget to adjust the split between views
- Widgets assigned to specific views using view_id
- Synchronized navigation between views
"""
import pydeck as pdk

# Data sources
COUNTRIES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'
AIR_PORTS = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson'

# Initial view centered on London
INITIAL_VIEW_STATE = pdk.ViewState(
    latitude=51.47,
    longitude=0.45,
    zoom=4,
    bearing=0,
    pitch=30
)

# Create two map views side-by-side
left_view = pdk.View(
    type='MapView',
    id='left-map',
    x='0%',
    width='50%',
    controller=True
)

right_view = pdk.View(
    type='MapView',
    id='right-map',
    x='50%',
    width='50%',
    controller=True
)

# Layers
countries_layer = pdk.Layer(
    'GeoJsonLayer',
    id='base-map',
    data=COUNTRIES,
    stroked=True,
    filled=True,
    line_width_min_pixels=2,
    opacity=0.4,
    get_line_color=[60, 60, 60],
    get_fill_color=[200, 200, 200]
)

airports_layer = pdk.Layer(
    'GeoJsonLayer',
    id='airports',
    data=AIR_PORTS,
    filled=True,
    point_radius_min_pixels=2,
    point_radius_scale=2000,
    get_point_radius='11 - properties.scalerank',
    get_fill_color=[200, 0, 80, 180],
    pickable=True,
    auto_highlight=True
)

# Create widgets - some are assigned to specific views
widgets = [
    # Left map widgets
    pdk.Widget('ZoomWidget', view_id='left-map'),
    pdk.Widget('CompassWidget', view_id='left-map'),
    pdk.Widget('FullscreenWidget', view_id='left-map'),
    pdk.Widget('ScreenshotWidget', view_id='left-map'),
    pdk.Widget('ResetViewWidget', view_id='left-map'),
    pdk.Widget('FpsWidget', view_id='left-map'),
    pdk.Widget('LoadingWidget', view_id='left-map'),
    pdk.Widget('ThemeWidget', view_id='left-map'),
    pdk.Widget('StatsWidget', statsType='luma', view_id='left-map'),

    # Right map widgets
    pdk.Widget('GeocoderWidget', view_id='right-map'),

    # Global widgets (not tied to a specific view)
    pdk.Widget('ScaleWidget', placement='bottom-right'),
    pdk.Widget('InfoWidget', mode='hover'),
    pdk.Widget('InfoWidget', mode='click'),
    pdk.Widget('ContextMenuWidget'),
    pdk.Widget('TimelineWidget',
        placement='bottom-left',
        time_range=[0, 24],
        step=1,
        initial_time=0,
        play_interval=1000
    ),

    # Splitter widget to adjust view sizes
    pdk.Widget('SplitterWidget',
        view_id1='left-map',
        view_id2='right-map',
        orientation='vertical'
    )
]

# Create deck with multiple views
deck = pdk.Deck(
    views=[left_view, right_view],
    initial_view_state={
        'left-map': INITIAL_VIEW_STATE,
        'right-map': INITIAL_VIEW_STATE
    },
    layers=[countries_layer, airports_layer],
    widgets=widgets,
    tooltip={
        'text': '{properties.name} ({properties.abbrev})\n{properties.type}'
    },
    map_provider='carto',
    map_style='https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
)

# Save to HTML
deck.to_html('widgets.html', css_background_color='#f0f0f0', offline=True)
print('Saved to widgets.html')
