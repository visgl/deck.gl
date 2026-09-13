import json

from pydeck import Extension


def test_extension_constructor():
    EXPECTED = {"@@type": "DataFilterExtension", "filterSize": 1}
    assert json.loads(Extension("DataFilterExtension", filter_size=1).to_json()) == EXPECTED


def test_extension_without_options():
    EXPECTED = {"@@type": "MaskExtension"}
    assert json.loads(Extension("MaskExtension").to_json()) == EXPECTED
