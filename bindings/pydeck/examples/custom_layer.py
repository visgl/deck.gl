import pydeck

# See https://github.com/ajduberstein/pydeck_custom_layer for a minimal example layer

pydeck.settings.custom_libraries = [
    {
        "libraryName": "LabeledGeoJsonLayer",
        "resourceUri": "https://raw.githubusercontent.com/ajduberstein/pydeck_custom_layer/master/dist/bundle.js",
    }
]

DATA_URL = (
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
)

custom_layer = pydeck.Layer(
    "LabeledGeoJsonLayer",
    data=DATA_URL,
    filled=False,
    billboard=False,
    get_line_color=[180, 180, 180],
    get_label="f.properties.name",
    get_label_size=20,
    get_label_color=[0, 64, 128],
    label_size_units='"meters"',
    line_width_min_pixels=1,
)

view_state = pydeck.ViewState(latitude=0, longitude=0, zoom=10, bearing=-45, pitch=60,)

r = pydeck.Deck(
    custom_layer,
    initial_view_state=view_state,
    map_style="mapbox://styles/mapbox/satellite-v9",
)

r.show()
