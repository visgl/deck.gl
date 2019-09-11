import pytest
import os
from pydeck import Deck, Layer, ViewState

from ..const import FIXTURE_STRING

text_data = [{'text': 'Test', 'position': [0.0, 0.0]}]
d = Deck(layers=[
    Layer(
        'TextLayer',
        data=text_data,
        get_color=[0, 255, 255],
        font_size=72,
        get_position='position')])
v = ViewState(latitude=0, longitude=0, zoom=15)
d.initial_view_state = v


@pytest.mark.skipif(os.environ.get('TRAVIS') == 'true', 'Skipping this test on Travis CI.')
@pytest.mark.asyncio
async def test_standalone_rendering(tmp_path):
    filename = d.to_html(str(tmp_path) + '/', open_browser=False, notebook_display=False)
    await go_to_page_and_screenshot('file://' + filename, filename, output_dir=tmp_path)


@pytest.mark.skip(reason='Not yet implemented')
@pytest.mark.asyncio
async def test_notebook_iframe_rendering():
    from .screenshot_utils import go_to_page_and_screenshot  # noqa
    pass


def main():
    asyncio.get_event_loop().run_until_complete(run_html())


if __name__ == '__main__':
    main()
