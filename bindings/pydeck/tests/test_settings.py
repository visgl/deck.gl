import pydeck


def test_settings_is_imported():
    assert pydeck.settings
    pydeck.settings.custom_libraries = [
        {"tagmapLibrary": "https://deck.gl/customBundle.js"},
        {"tagmapLibrary2": "https://deck.gl/customBundle2.js"}
    ]
    tagmap_layer = pydeck.Layer('TagmapLayer', [])
    r = pydeck.Deck(tagmap_layer)
    html_str = r.to_html(as_string=True)
    assert "{'tagmapLibrary': 'https://deck.gl/customBundle.js'}" in html_str
    assert "{'tagmapLibrary2': 'https://deck.gl/customBundle2.js'}" in html_str
