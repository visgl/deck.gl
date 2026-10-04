import json
import pathlib
import re

import pytest

import pydeck
from pydeck.settings import DECKGL_MINOR, SHARED_PACKAGES


@pytest.fixture(autouse=True)
def restore_custom_libraries():
    """The settings object is a module-level singleton; keep tests from leaking into each other"""
    saved = list(pydeck.settings.custom_libraries)
    saved_cdn = pydeck.settings.esm_cdn
    yield
    pydeck.settings.custom_libraries = saved
    pydeck.settings.esm_cdn = saved_cdn


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


def test_register_library():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library("tagmapLibrary", "https://deck.gl/customBundle.js")
    # Keys must match what @deck.gl/jupyter-widget's addCustomLibraries destructures
    assert pydeck.settings.custom_libraries == [
        {"libraryName": "tagmapLibrary", "resourceUri": "https://deck.gl/customBundle.js"}
    ]
    r = pydeck.Deck(pydeck.Layer("TagmapLayer", []))
    html_str = r.to_html(as_string=True)
    assert _custom_libraries_from_html(html_str) == pydeck.settings.custom_libraries
    if hasattr(r, "deck_widget"):
        assert r.deck_widget.custom_libraries == pydeck.settings.custom_libraries


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


EXTERNAL = ",".join(SHARED_PACKAGES)


def test_register_npm_community_package_matches_deckgl_version():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library(npm="@deck.gl-community/layers")
    assert pydeck.settings.custom_libraries == [
        {
            "libraryName": "@deck.gl-community/layers",
            "resourceUri": f"https://esm.sh/@deck.gl-community/layers@~{DECKGL_MINOR}?external={EXTERNAL}",
            "module": True,
        }
    ]


def test_register_npm_package_with_version_and_name():
    pydeck.settings.custom_libraries = []
    pydeck.settings.register_library("MyLayers", npm="my-layers@^1.2")
    pydeck.settings.register_library(npm="other-layers")
    assert [entry["resourceUri"] for entry in pydeck.settings.custom_libraries] == [
        f"https://esm.sh/my-layers@^1.2?external={EXTERNAL}",
        f"https://esm.sh/other-layers?external={EXTERNAL}",
    ]
    assert pydeck.settings.custom_libraries[0]["libraryName"] == "MyLayers"


def test_register_npm_warns_on_other_deckgl_version():
    pydeck.settings.custom_libraries = []
    with pytest.warns(UserWarning, match="deck.gl 8.9"):
        pydeck.settings.register_library(npm="@deck.gl-community/layers@~8.9.0")
    assert pydeck.settings.custom_libraries[0]["resourceUri"].startswith(
        "https://esm.sh/@deck.gl-community/layers@~8.9.0?"
    )


def test_register_npm_uses_esm_cdn():
    pydeck.settings.custom_libraries = []
    pydeck.settings.esm_cdn = "https://esm.example.com/"
    pydeck.settings.register_library(npm="my-layers@1.0.0")
    assert pydeck.settings.custom_libraries[0]["resourceUri"] == (
        f"https://esm.example.com/my-layers@1.0.0?external={EXTERNAL}"
    )


def test_register_library_argument_errors():
    with pytest.raises(ValueError):
        pydeck.settings.register_library("Both", "https://deck.gl/x.js", npm="my-layers")
    with pytest.raises(ValueError):
        pydeck.settings.register_library("Neither")
    with pytest.raises(ValueError):
        pydeck.settings.register_library(uri="https://deck.gl/x.js")


def test_shared_packages_match_jupyter_widget():
    shared_modules = pathlib.Path(__file__).parents[3] / "modules/jupyter-widget/src/playground/shared-modules.js"
    if not shared_modules.exists():
        pytest.skip("jupyter-widget source not available")
    specifiers = re.findall(r"^  '(@[^']+)':", shared_modules.read_text(), re.M)
    assert specifiers, "SHARED_MODULES not found"
    packages = {"/".join(specifier.split("/")[:2]) for specifier in specifiers}
    assert set(SHARED_PACKAGES) == packages
