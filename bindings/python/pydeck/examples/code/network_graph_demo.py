"""Experimental: Making network graphs in pydeck"""
import pydeck

from collections import OrderedDict
import math
import random

view_state = pydeck.ViewState(
    offset=[0, 0],
    target=[1000, 110],
    latitude=None,
    longitude=None,
    bearing=None,
    pitch=None,
    zoom=1)

views = [pydeck.View(type='OrthographicView', controller=True)]

nodes, edges = OrderedDict([]), []
# Generate 10,000 random nodes
for i in range(10000):
    x = (math.cos(i * 2 * math.pi) + random.random()) * 520
    y = (math.sin(i * 2 * math.pi) + random.random()) * 320
    nodes[i] = {'position': [x, y], 'id': i}

# Generate 80,000 random edges between those nodes
for i in range(80000):
    rand_source = random.randrange(0, 10000)
    rand_target = random.randrange(0, 10000)
    edges.append({
        'id': i,
        'source': nodes[rand_source]['position'],
        'target': nodes[rand_target]['position']})


nodes_layer = pydeck.Layer(
    'ScatterplotLayer',
    list(nodes.values()),
    get_position='position',
    pickable=True,
    auto_highlight=True,
    radius=5,
    highlight_color=[255, 255, 0],
    coordinate_system=0)

edges_layer = pydeck.Layer(
    'LineLayer',
    edges,
    get_source_position='source',
    get_target_position='target',
    get_color=[220, 220, 220, 20],
    coordinate_system=0)

r = pydeck.Deck(
    layers=[edges_layer, nodes_layer],
    initial_view_state=view_state,
    views=views,
    height=1000,
    map_style='')
r.to_html()
