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


def test_register_library():
    original_libraries = pydeck.settings.custom_libraries
    pydeck.settings.custom_libraries = []
    try:
        pydeck.settings.register_library("tagmapLibrary", "https://deck.gl/customBundle.js")
        # Keys must match what @deck.gl/jupyter-widget's addCustomLibraries destructures
        assert pydeck.settings.custom_libraries == [
            {"libraryName": "tagmapLibrary", "resourceUri": "https://deck.gl/customBundle.js"}
        ]
        r = pydeck.Deck(pydeck.Layer("TagmapLayer", []))
        html_str = r.to_html(as_string=True)
        assert "'resourceUri': 'https://deck.gl/customBundle.js'" in html_str
        if hasattr(r, "deck_widget"):
            assert r.deck_widget.custom_libraries == pydeck.settings.custom_libraries
    finally:
        pydeck.settings.custom_libraries = original_libraries
