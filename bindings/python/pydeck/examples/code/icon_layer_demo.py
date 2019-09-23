"""
Corresponds to https://deck.gl/#/examples/core-layers/icon-layer
Note that this deck.gl example requires some custom Javascript logic around zoom levels
and is not replicated exactly here
"""
import pydeck


DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/icon/meteorites.json'

INITIAL_VIEW_STATE = pydeck.ViewState(
    longitude=-35,
    latitude=36.7,
    zoom=1.8,
    max_zoom=20,
    pitch=0,
    bearing=0)

icon_layer = pydeck.Layer(
    'IconLayer',
    DATA_URL,
    get_icon='marker',
    size_units='meters',
    size_scale=2000,
    pickable=True,
    auto_highlight=True,
    size_min_pixels=6)

r = pydeck.Deck(
    layers=[icon_layer],
    initial_view_state=INITIAL_VIEW_STATE)


r.to_html()
