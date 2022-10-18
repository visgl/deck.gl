import html
import webbrowser
import pydeck

try:
    from unittest.mock import MagicMock
except ImportError:
    from mock import MagicMock

from pydeck.io.html import (
    cdn_picker,
    display_html,
    iframe_with_srcdoc,
    in_jupyter,
    render_json_to_html,
    deck_to_html,
    CDN_URL,
)
from IPython.display import HTML

from ..fixtures import fixtures


def test_rendering_is_not_broken():
    rendered = render_json_to_html(fixtures["minimal"], "fake_key")
    assert fixtures["minimal"] in rendered
    assert "fake_key" in rendered


def test_display_html():
    webbrowser.open = MagicMock()
    display_html("test.htm")
    webbrowser.open.assert_called_once_with("file://test.htm")


def test_cdn_picker(monkeypatch):
    assert len(cdn_picker(offline=True)) > 1000
    PORT = 8080
    monkeypatch.setenv("PYDECK_DEV_PORT", PORT)
    assert "localhost:{}".format(PORT) in cdn_picker()
    monkeypatch.delenv("PYDECK_DEV_PORT", raising=False)
    assert CDN_URL in cdn_picker()


def test_iframe_with_srcdoc():

    import IPython

    IPython.display.HTML = MagicMock()
    html_str = "<html></html>"
    iframe_with_srcdoc(html_str)
    escaped_html_str = html.escape("<html></html>")

    iframe = f"""
        <iframe
            width="100%"
            height=500
            frameborder="0"
            srcdoc="{escaped_html_str}"
        ></iframe>
    """

    IPython.display.HTML.assert_called_once_with(iframe)


def test_in_jupyter():
    assert not in_jupyter()


def test_deck_to_html_string():
    output = deck_to_html(fixtures["minimal"], as_string=True)
    assert isinstance(output, str)


def test_deck_to_html_jupyter():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_jupyter = MagicMock(return_value=True)
    output = deck_to_html(fixtures["minimal"])
    pydeck.io.html.iframe_with_srcdoc.assert_called_once()
    pydeck.io.html.render_for_colab.assert_not_called()
    assert isinstance(output, HTML)
    assert output.data == "Hello"


def test_deck_to_html():
    pydeck.io.html.iframe_with_srcdoc = MagicMock(return_value=HTML("Hello"))
    pydeck.io.html.render_for_colab = MagicMock()
    pydeck.io.html.in_google_colab = True
    html = deck_to_html(fixtures["minimal"])
    pydeck.io.html.in_google_colab = False
    pydeck.io.html.iframe_with_srcdoc.assert_not_called()
    pydeck.io.html.render_for_colab.assert_called_once()
    assert html is None
