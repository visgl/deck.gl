Publication checklist for pydeck
==========

### Notes before publication

- Run these commands in a virtual environment managed by [uv](https://docs.astral.sh/uv/).
- Build deck.gl from its source.
- Install pydeck from its source.
- This checklist assumes that you have PyPI credentials to publish pydeck.
- Verify that there is a CDN-hosted release of @deck.gl/jupyter-widget for the standalone html template
within pydeck accessible on [JSDelivr](https://www.jsdelivr.com/package/npm/@deck.gl/jupyter-widget).
Check that the version matches `DECKGL_SEMVER` in `pydeck/frontend_semver.py`.
- Optional but encouraged: Check that the build works on test.pypi. See *Producing a test release* below.

### Version bump

Update the version in the following files:

- `pydeck/_version.py` — the canonical Python version
- `pyproject.toml` — the package metadata version
- `docs/conf.py` — the Sphinx documentation version and release

**Do not** run `bump_version.py` — it reads `lerna.json` which may contain a pre-release deck.gl version
and would overwrite `DECKGL_SEMVER` in `pydeck/frontend_semver.py`.

Update `docs/CHANGELOG.rst` with release notes for the new version.

### Producing a production release

1) Verify that Deck object works on a fresh install from the source in the following
environments:

- `.show()` in a Jupyter Notebook
- `.to_html()` in a Jupyter Notebook
- `.show()` in JupyterLab
- `.to_html()` in JupyterLab
- `.to_html()` in a Python REPL

2) Build and publish the package:

```bash
uv pip install build twine
rm -rf dist/
python -m build
python -m twine upload dist/*
```

3) Verify that your publications are successful:

- [pydeck on PyPI](https://pypi.org/project/pydeck/)
- [pydeck on Conda-forge](https://anaconda.org/conda-forge/pydeck) (updated automatically via feedstock)

4) Inform the deck.gl Slack channel that a new version of pydeck has been published.


### Producing a test release

1) Build the package:

```bash
uv pip install build twine
rm -rf dist/
python -m build
```

2) Upload to the test.pypi environment:

```bash
python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```

3) In a fresh virtualenv, install pydeck from test.pypi:

```bash
uv pip install -i https://test.pypi.org/simple/ pydeck=={{version}}
```

where `{{version}}` is your semantic version.

4) Verify that pydeck works from test.pypi in the same environments as above.

5) If everything appears to be working, publish to PyPI (see production release steps).

## Updating documentation

The pydeck documentation has three main components:

- The .md files in the pydeck directory.
- The .rst files in the pydeck directory under `docs/`.
- The docstrings in the Python code itself, which combined with the .rst files generates
the documentation at https://deckgl.readthedocs.io/en/latest/.

Documentation is built automatically by [ReadTheDocs](https://readthedocs.org/projects/deckgl/)
on push via webhook. The build configuration is in `.readthedocs.yaml` and uses uv for
dependency installation.

To build docs locally:

```bash
cd docs
make html
# Serve at http://localhost:8000
python -m http.server -d _build/html
```
