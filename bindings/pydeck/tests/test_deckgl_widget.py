import pytest


try:
    from pydeck.widget import DeckGLWidget
except ModuleNotFoundError:
    import warnings

    warnings.warn("Widget test will fail")


@pytest.mark.skip("Skipping widget test, see #7783")
def test_example_creation_blank():
    w = DeckGLWidget()
    assert w.json_input == ""
