import pydeck


DATA_URL = 'https://raw.githubusercontent.com/ajduberstein/sf_public_data/master/bay_area_commute_routes.csv'

GREEN_RGB = [0, 255, 0, 40]
RED_RGB = [240, 100, 0, 40]

arc_layer = pydeck.Layer(
    'ArcLayer',
    data=DATA_URL,
    get_width='S000 * 2',
    get_source_position=['lng_h', 'lat_h'],
    get_target_position=['lng_w', 'lat_w'],
    get_tilt=15,
    get_source_color=RED_RGB,
    get_target_color=GREEN_RGB
)

view_state = pydeck.ViewState(
    latitude=37.7576171,
    longitude=-122.5776844,
    bearing=45,
    max_pitch=360,
    pitch=50,
    zoom=8
)

r = pydeck.Deck(arc_layer, initial_view_state=view_state)
r.to_html('arc_layer.html', notebook_display=False)
