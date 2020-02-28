import pydeck

pydeck.settings.custom_libraries = [
    {
        "libraryName": "FilterExtensionLib",  # TODO change
        "resourceUri": "http://localhost:3000/dist/bundle.js",  # TODO change
    }
]

custom_layer = pydeck.Layer(
    "ScatterplotFilterLayer",
    data="https://duberste.in/sf_growth/data/business.csv",
    get_position=["lng", "lat"],
    get_fill_color=[160, 160, 180],
    get_line_color=[0, 0, 0],
    get_line_width=2,
    get_filter_value="start_date",
    filter_range=[1967, 1986],
    filter_soft_range=[1966, 1985],
)

view_state = pydeck.ViewState(
    latitude=37.7576171, longitude=-122.5776844, zoom=10, bearing=-45, pitch=60,
)

r = pydeck.Deck(
    custom_layer,
    initial_view_state=view_state,
    map_style="mapbox://styles/mapbox/satellite-v9",
)

r.to_html("custom_layer.html", notebook_display=False)
