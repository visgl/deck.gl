import pytest

import os
import sys
import tempfile
from pathlib import Path
import webbrowser

try:
    from unittest.mock import MagicMock
except ImportError:
    from mock import MagicMock

from pydeck.io.html import display_html, render_json_to_html, open_named_or_temporary_file

from ..fixtures import fixtures


def test_rendering_is_not_broken():
    rendered = render_json_to_html(fixtures["minimal"], "fake_key")
    assert fixtures["minimal"] in rendered
    assert "fake_key" in rendered


def test_display_html():
    webbrowser.open = MagicMock()
    display_html("test.htm", 500, 500)
    webbrowser.open.assert_called_once_with("file://test.htm")


def test_open_named_or_temporary_file(tmp_path):
    # Verify that a file is created with a .html extension and in write mode
    path = tmp_path / "test_file"
    named_file = open_named_or_temporary_file(str(path))
    assert named_file.mode == "w+"

    path = str(tmp_path / "test_file.html")
    is_saved_at_path = not os.path.isfile("test_file.html") and os.path.isfile(path)
    # Verify that a file with the given name is created at the specified path
    assert is_saved_at_path

    # Verify that a temporary file
    add_html_file = open_named_or_temporary_file(str(tmp_path / "test_file"))
    assert add_html_file.name.endswith(".html")
    assert os.path.isfile(add_html_file.name)

    # Verify the ability to create a local temporary file
    try:
        local_temporary_file = open_named_or_temporary_file()
        assert add_html_file.name.endswith(".html")
        assert os.path.isfile(local_temporary_file.name)
    finally:
        os.remove(local_temporary_file.name)

    # Verify that there's a directory at the specified path with an html file in it
    parent_dir = str(tmp_path / "test_dir") + "/"
    assert not os.path.isdir(parent_dir)
    directory_given_file = open_named_or_temporary_file(parent_dir)
    assert directory_given_file.name.endswith(".html")
    assert os.path.isfile(directory_given_file.name)
    assert os.path.isdir(parent_dir)
