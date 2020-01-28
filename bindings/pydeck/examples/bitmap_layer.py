import pydeck


# Map of San Francisco from 1906
IMG_URL = '"https://i.imgur.com/W95ked7.jpg"'

BOUNDS = [
    [-122.52690000000051, 37.70313158980733],
    [-122.52690000000051, 37.816395657523195],
    [-122.34604834372873, 37.816134829424335],
    [-122.34656848822227, 37.70339041384273]
]

bitmap_layer = pydeck.Layer(
    'BitmapLayer',
    data=None,
    image=IMG_URL,
    bounds=BOUNDS,
    opacity=0.7
)

view_state = pydeck.ViewState(
    latitude=37.7576171,
    longitude=-122.5776844,
    zoom=10,
    bearing=-45,
    pitch=60,
)

r = pydeck.Deck(
    bitmap_layer,
    initial_view_state=view_state,
    map_style='mapbox://styles/mapbox/satellite-v9')

r.to_html('bitmap_layer.html', notebook_display=False)
