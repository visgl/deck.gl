import pytest
import os
from pydeck import Deck, Layer, ViewState

from ..const import FIXTURE_STRING
from .screenshot_utils import go_to_page_and_screenshot

text_data = [{'text': 'Hey', 'position': [0, 0], 'radius': 100}]
d = Deck(layers=[Layer('TextLayer', data=text_data), Layer('ScatterplotLayer', data=text_data)])
v = ViewState(latitude=0, longitude=0, zoom=15)
d.initial_view_state = v


@pytest.mark.asyncio
async def test_standalone_rendering(tmp_path):
    filename = d.to_html(open_browser=False)
    await go_to_page_and_screenshot('file://' + filename, filename, output_dir=tmp_path)


@pytest.mark.skip(reason='Not yet implemented')
@pytest.mark.asyncio
async def test_notebook_iframe_rendering():
    pass


def main():
    asyncio.get_event_loop().run_until_complete(run_html())


if __name__ == '__main__':
    main()
