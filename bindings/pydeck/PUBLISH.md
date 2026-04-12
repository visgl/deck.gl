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

Run `make bump-version` and select a release type at the prompt. This bumps all version files:

- `pydeck/_version.py` — the canonical Python version
- `pyproject.toml` — the package metadata version (used by `python -m build`)
- `docs/conf.py` — the Sphinx documentation version and release
- `pydeck/frontend_semver.py` — synced to the deck.gl version in `lerna.json`

**Note:** `bump_version.py` reads `lerna.json` to set `DECKGL_SEMVER`. When releasing from a
release branch (e.g. `9.2-release`), lerna.json has the stable version and this works correctly.
If releasing from `master` where lerna.json may contain a pre-release version (e.g. `9.3.0-beta.1`),
you must manually update `pydeck/frontend_semver.py` after running `make bump-version`.

Update `docs/CHANGELOG.rst` with release notes for the new version.

### Local build testing

Build the wheel from the pydeck dev environment:

```bash
cd bindings/pydeck
source .venv/bin/activate
uv pip install build
python -m build
```

Then install it in a fresh venv with Jupyter dependencies:

```bash
uv venv /tmp/pydeck-test
source /tmp/pydeck-test/bin/activate
uv pip install dist/pydeck-*.whl notebook jupyterlab pandas numpy requests ipywidgets networkx
```

Run through the verification checklist:

```bash
# 1. .to_html() in a Python REPL
python -c "
import pydeck as pdk
layer = pdk.Layer('ScatterplotLayer', data=[{'pos': [-122.4, 37.8]}], get_position='pos', get_radius=1000, get_fill_color=[255, 0, 0])
view = pdk.ViewState(latitude=37.8, longitude=-122.4, zoom=10)
deck = pdk.Deck(layers=[layer], initial_view_state=view)
deck.to_html('/tmp/pydeck-test.html')
print('to_html: OK')
"
open /tmp/pydeck-test.html

# 2. Run example notebooks in Jupyter Notebook or JupyterLab
jupyter notebook examples/
jupyter lab examples/
```

**Note on `.show()` vs `.to_html()`:** In pydeck v0.9+, `.show()` is a wrapper around
`.to_html()` — both render via an HTML iframe using the deck.gl JS bundle from jsDelivr.
The earlier ipywidgets-based `.show()` (which supported binary transport, data selection,
and live `.update()` calls) is not currently functional. Neither nbextension nor labextension
setup is required for the current `.show()` / `.to_html()` behavior.

Restoring full Jupyter widget support (ipywidgets protocol, prebuilt labextension) is
tracked as a future improvement.

### Producing a production release

1) Verify that pydeck renders correctly (see *Local build testing*):

- `.show()` in a Jupyter Notebook
- `.to_html()` in a Jupyter Notebook
- `.show()` in JupyterLab
- `.to_html()` in JupyterLab
- `.to_html()` in a Python REPL

2) Build and publish:

```bash
make publish-pypi
```

This runs `python -m build` to create sdist (.tar.gz) and wheel (.whl) distribution files
in `dist/`, then uses [twine](https://twine.readthedocs.io/) to upload them to PyPI. Twine
is the standard tool for securely uploading Python packages — it handles authentication,
TLS verification, and upload retries.

Or to run the full release flow (bump + test + commit + publish):

```bash
make release
```

3) Verify that your publications are successful:

- [pydeck on PyPI](https://pypi.org/project/pydeck/)
- [pydeck on Conda-forge](https://anaconda.org/conda-forge/pydeck) (updated automatically via feedstock)

4) Inform the deck.gl Slack channel that a new version of pydeck has been published.


### Producing a test release

1) Build and upload to test.pypi:

```bash
make publish-test-pypi
```

2) In a fresh virtualenv, install pydeck from test.pypi:

```bash
uv pip install -i https://test.pypi.org/simple/ pydeck=={{version}}
```

where `{{version}}` is your semantic version.

3) Verify that pydeck works from test.pypi in the same environments as above.

4) If everything appears to be working, publish to PyPI (see production release steps).

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

### Binder examples (dormant)

There is a historical `binder` branch with a Dockerfile that let users run pydeck examples
interactively on [mybinder.org](https://mybinder.org). It was last updated around the 0.4
release (~2020) and is not currently maintained. To revive it, update the Dockerfile on
the `binder` branch and verify at mybinder.org.

### Screenshot examples

Gallery thumbnails are generated with `make html-thumbnails` from the `docs/` directory.
This uses Playwright to render each example's HTML output and save a screenshot. See
`docs/scripts/snap_thumbnails.py` for details. To snap a single example:

```bash
cd docs
uv run python scripts/snap_thumbnails.py ../examples/widgets.py
```
