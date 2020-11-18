import pydeck


def test_settings_is_imported():
    assert pydeck.settings
    pydeck.settings.custom_libraries = [
        {"libraryName": "tagmapLibrary", "resourceUri": "https://deck.gl/customBundle.js"},
        {"libraryName": "tagmapLibrary2", "resourceUri": "https://deck.gl/customBundle2.js"},
    ]
    tagmap_layer = pydeck.Layer("TagmapLayer", [])
    r = pydeck.Deck(tagmap_layer)
    html_str = r.to_html(as_string=True)
    assert "https://deck.gl/customBundle.js" in html_str
    assert "https://deck.gl/customBundle2.js" in html_str
