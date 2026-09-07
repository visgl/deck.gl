import json
import re

import pytest

import pydeck


@pytest.fixture(autouse=True)
def restore_custom_libraries():
    """The settings object is a module-level singleton; keep tests from leaking into each other"""
    saved = list(pydeck.settings.custom_libraries)
    yield
    pydeck.settings.custom_libraries = saved


def _custom_libraries_from_html(html_str):
    match = re.search(r"const customLibraries = (.*?);\s*\n", html_str, re.S)
    assert match, "customLibraries not found in rendered HTML"
    return json.loads(match.group(1))


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


def test_register_library_uses_resource_uri_key():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library("DemoLibrary", "https://deck.gl/demo.js")
    assert pydeck.settings.custom_libraries == [
        {"libraryName": "DemoLibrary", "resourceUri": "https://deck.gl/demo.js"}
    ]


def test_module_library_renders_as_json():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library("EsmLibrary", "https://deck.gl/demo.mjs", module=True)
    html_str = pydeck.Deck(pydeck.Layer("DemoLayer", [])).to_html(as_string=True)
    assert _custom_libraries_from_html(html_str) == [
        {"libraryName": "EsmLibrary", "resourceUri": "https://deck.gl/demo.mjs", "module": True}
    ]


def test_no_custom_libraries_renders_null():
    pydeck.settings.custom_libraries = []
    html_str = pydeck.Deck(pydeck.Layer("ScatterplotLayer", [])).to_html(as_string=True)
    assert "const customLibraries = null;" in html_str


def test_custom_libraries_cannot_close_the_script_element():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library("Evil</script><script>alert(1)</script>", "https://deck.gl/x.js")
    html_str = pydeck.Deck(pydeck.Layer("DemoLayer", [])).to_html(as_string=True)
    assert "</script><script>alert(1)" not in html_str
    assert _custom_libraries_from_html(html_str)[0]["libraryName"] == ("Evil</script><script>alert(1)</script>")
