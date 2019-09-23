"""
An example of the deck.gl OrbitView

Most pydeck/deck.gl examples are projected onto a Mercator WGS84 map of earth
However, they don't have to be.

The data set is provided by NASA here: https://data.nasa.gov/resource/2vr3-k9wn.json

TODO finish
"""

DATA_URL = 'ttps://data.nasa.gov/resource/2vr3-k9wn.json'


point_cloud = pydeck.Layer(
    'PointCloudLayer',
    DATA_URL
    size_min_pixels=6)

earth = pydeck.Layer(
  # TODO where to find an opengl globe?
)

r = pydeck.Deck(
    layers=[point_cloud],
    initial_view_state=None,
    views=[View(type='OrbitView')
)


r.to_html()
