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


def test_all_extensions_have_a_gallery_example():
    covered = " ".join(open(p).read() for p in EXTENSION_EXAMPLES)
    # Fp64Extension has no visual effect, so it is intentionally not a gallery example
    expected = [e for e in EXTENSION_TYPES if e != "Fp64Extension"]
    missing = [e for e in expected if e not in covered]
    assert not missing, "Missing gallery examples for: {}".format(missing)
