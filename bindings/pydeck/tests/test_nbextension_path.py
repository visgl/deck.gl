#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Uber Technologies, Inc.
# Distributed under the terms of the Modified BSD License.


def test_nbextension_path():
    # Check that magic function can be imported from package root:
    from pydeck import _jupyter_nbextension_paths

    # Ensure that it can be called without incident:
    path = _jupyter_nbextension_paths()
    # Some sanity checks:
    assert len(path) == 1
    assert isinstance(path[0], dict)


def test_nbextension_config_matches_require():
    # setup.py installs pydeck.json into etc/jupyter/nbconfig/notebook.d, so it must enable the require target
    import json
    import pathlib

    import pydeck
    from pydeck import _jupyter_nbextension_paths

    [path] = _jupyter_nbextension_paths()
    config = json.loads((pathlib.Path(__file__).parents[1] / "pydeck.json").read_text())
    load_extensions = config["load_extensions"]
    assert load_extensions == {path["require"]: True}

    static_dir = pathlib.Path(pydeck.__file__).parent / path["src"]
    for require in load_extensions:
        dest, _, name = require.partition("/")
        assert dest == path["dest"]
        assert (static_dir / f"{name}.js").is_file()
