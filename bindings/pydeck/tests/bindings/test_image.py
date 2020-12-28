from pydeck.types import Image

import pathlib


test_image = pathlib.Path(__file__).parent.absolute() / "../fixtures/red-dot.png"
ENCODED_TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="


def test_url_case():
    URL = "https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg"
    assert Image(URL) == "https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg"


def test_local_file_case():
    assert Image(str(test_image)) == ENCODED_TEST_IMAGE
