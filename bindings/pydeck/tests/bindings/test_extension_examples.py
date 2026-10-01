import glob
import json
import os
import py_compile

import pytest

from pydeck import Extension

# Every extension registered in the widget's JSON catalog. Constructing each via
# pdk.Extension and serializing must yield its @@type — the contract the gallery
# examples and the widget registration depend on.
EXTENSION_TYPES = [
    "BrushingExtension",
    "ClipExtension",
    "CollisionFilterExtension",
    "DataFilterExtension",
    "FillStyleExtension",
    "Fp64Extension",
    "MaskExtension",
    "PathStyleExtension",
    "TerrainExtension",
]

EXAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "examples"))
EXTENSION_EXAMPLES = sorted(glob.glob(os.path.join(EXAMPLES_DIR, "extensions", "*.py")))


@pytest.mark.parametrize("ext_type", EXTENSION_TYPES)
def test_extension_type_serializes(ext_type):
    assert json.loads(Extension(ext_type).to_json()) == {"@@type": ext_type}


@pytest.mark.parametrize("path", EXTENSION_EXAMPLES, ids=lambda p: os.path.basename(p))
def test_extension_example_is_valid(path):
    # The gallery example compiles and uses the pdk.Extension API end to end.
    py_compile.compile(path, doraise=True)
    src = open(path).read()
    assert "pdk.Extension(" in src
    assert "to_html(" in src


def test_literal_string_props_serialize_verbatim():
    # pydeck prefixes plain string kwargs with "@@=" (accessor expressions). Literal enum
    # props used by extensions must be quoted so they serialize verbatim, not as accessors.
    from pydeck import Deck, Layer

    mask = Layer("SolidPolygonLayer", [{"polygon": [[0, 0]]}], id="sf-mask", get_polygon="polygon", operation="'mask'")
    masked = Layer(
        "ScatterplotLayer",
        [{"c": [0, 0]}],
        get_position="c",
        mask_id="'sf-mask'",
        extensions=[Extension("MaskExtension")],
    )
    layers = json.loads(Deck([mask, masked]).to_json())["layers"]
    assert layers[0]["operation"] == "mask"
    assert layers[1]["maskId"] == "sf-mask"

    brush = Layer(
        "ScatterplotLayer",
        [{"c": [0, 0]}],
        get_position="c",
        brushing_target="'source'",
        extensions=[Extension("BrushingExtension")],
    )
    assert json.loads(Deck(brush).to_json())["layers"][0]["brushingTarget"] == "source"

    terrain_route = Layer(
        "PathLayer",
        [{"path": [[0, 0]]}],
        get_path="path",
        terrain_draw_mode="'drape'",
        extensions=[Extension("TerrainExtension")],
    )
    assert json.loads(Deck(terrain_route).to_json())["layers"][0]["terrainDrawMode"] == "drape"


def test_all_extensions_have_a_gallery_example():
    covered = " ".join(open(p).read() for p in EXTENSION_EXAMPLES)
    # Fp64Extension has no visual effect, so it is intentionally not a gallery example
    expected = [e for e in EXTENSION_TYPES if e != "Fp64Extension"]
    missing = [e for e in expected if e not in covered]
    assert not missing, "Missing gallery examples for: {}".format(missing)
