import pytest
import os
from pydeck import Deck, Layer, ViewState

from ..fixtures import fixtures

text_data = [{"text": "Test", "position": [0.0, 0.0]}]
scatterplot_data = [
    {"rgb": [136, 45, 97], "position": [-0.002, 0.002]},
    {"rgb": [170, 57, 57], "position": [-0.002, -0.002]},
    {"rgb": [45, 136, 45], "position": [0.002, -0.002]},
    {"rgb": [123, 159, 53], "position": [0.002, 0.002]},
]
d = Deck(
    layers=[
        Layer(
            "ScatterplotLayer",
            data=scatterplot_data,
            get_radius=100,
            picking_radius=5,
            pickable=True,
            get_color="rgb",
            get_position="position",
        ),
        Layer(
            "TextLayer",
            data=text_data,
            picking_radius=5,
            get_color=[255, 255, 255],
            pickable=True,
            font_size=72,
            get_position="position",
        ),
    ]
)
v = ViewState(latitude=0, longitude=0, zoom=15)
d.initial_view_state = v


def has_pyppeteer():
    try:
        import pyppeteer  # noqa

        return True
    except ImportError:
        return False


@pytest.mark.skipif(
    os.environ.get("TRAVIS") == "true" or not has_pyppeteer(), reason="Skipping Python screenshot tests"
)
@pytest.mark.asyncio
async def test_standalone_rendering(tmp_path):
    from .screenshot_utils import go_to_page_and_screenshot  # noqa

    filename = d.to_html(str(tmp_path) + "/", open_browser=False, offline=True, notebook_display=False)
    await go_to_page_and_screenshot("file://" + filename, filename, output_dir=tmp_path)

    d.map_provider = "google_maps"
    d.map_style = "satellite"
    filename = d.to_html(str(tmp_path) + "/", open_browser=False, offline=True, notebook_display=False)
    await go_to_page_and_screenshot("file://" + filename, filename, output_dir=tmp_path)


@pytest.mark.skip(reason="Not yet implemented")
@pytest.mark.asyncio
async def test_notebook_iframe_rendering():
    pass
