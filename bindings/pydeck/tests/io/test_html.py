import pytest

import html
import os
import sys
import tempfile
from pathlib import Path
import webbrowser

import IPython

try:
    from unittest.mock import MagicMock
except ImportError:
    from mock import MagicMock

from pydeck.io.html import cdn_picker, display_html, iframe_with_srcdoc, in_jupyter, render_json_to_html, CDN_URL

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
    IPython.display.HTML = MagicMock()
    html_str = "<html></html>"
    iframe_with_srcdoc(html_str)
    escaped_html_str = html.escape("<html></html>")
    iframe = """<iframe src="about:blank" frameborder="0" srcdoc="{escaped_html_str}" width="100%" height=500></iframe>""".format(
        escaped_html_str=escaped_html_str
    )
    IPython.display.HTML.assert_called_once_with(iframe)


def test_in_jupyter():
    assert not in_jupyter()
