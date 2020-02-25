Publication checklist for pydeck
==========

### Notes before publication

- Run these commands in a virtual environment.
- Build deck.gl from its source.
- Install pydeck from its source.
- This checklist also assumes that you have PyPI credentials to publish pydeck
and valid NPM credentials to publish @deck.gl/juypter-widget.
- Verify that there is a CDN-hosted release of @deck.gl/jupyter-widget for the standalone html template
within pydeck accessible on [JSDelivr](https://www.jsdelivr.com/package/npm/@deck.gl/jupyter-widget).
- Optional but encouraged: Check that the build works on test.pypi. See *Producing a test release* below.

### Producing a production release

1) Verify that Deck object works on a fresh install from the source in the following
environments:

- `.show()` in a Jupyter Notebook
- `.to_html()` in a Jupyter Notebook
- `.show()` in Jupyter Lab
- `.to_html()` in Jupyter Lab
- `.to_html()` in a Python REPL

2) Run `make bump-and-publish` and select the kind of release at the prompt.
This will run Python and JS tests and produce a commit with the release version.

3) Verify that your publications are successful:

- https://pypi.org/project/pydeck/
- Conda-forge URL TBD

4) Inform the deck.gl Slack channel that a new version of pydeck has been published.


### Producing a test release

1) Run `python bump_version.py -h` to bump the version programmatically.

2) Run the following commands to publish to the test.pypi environment:

```
rm -r ./dist/*  # If exists, clear out the current dist folder
pip install . --verbose
python setup.py sdist bdist_wheel
pip install twine  # If you have not installed twine
python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```

3) In a fresh virtualenv, you can install pydeck from test.pypi:

```
pip install -i https://test.pypi.org/simple/ pydeck=={{version}}
```

where `{{version}}` is your semantic version.

4)  Verify that pydeck works from test.pypi in the same environments as above.

5) If everything appears to be working, you can publish to PyPI and conda-forge.

## Updating documentation

The pydeck documentation has three main components

- The .md files in the pydeck directory.
- The .rst files in the pydeck directory under `docs/`.
- The Binder examples, which are kept on the `binder` branch of this repository.
- Most critically, the docstrings in the Python code itself, which combined with the .rst files generates
the documentation at https://deckgl.readthedocs.io/en/latest/.

The documentation is currently build manually at the [readthedocs](https://readthedocs.org/projects/deckgl/) admin page.

### Updating the binder branch

Align the binder branch in-line with what's on master:

```
git checkout master
git pull
git checkout binder
git merge binder
git push
```

The Dockerfile at the root of the deck.gl repository on the binder branch can be tested locally with the following code:

```bash
docker build -t test-binder:latest .
docker run -p 8888:8888 test-binder:latest jupyter notebook --ip 0.0.0.0
```

This is what Binder will be executing when running the examples.

Verify the current examples work at https://mybinder.org/v2/gh/uber/deck.gl/binder


### Populating website pydeck.gl (WIP)

```bash
# If you've never done any Python setup for pydeck
make pre-init
# To create static images and .html files associated with the examples in `examples/`
make screenshot-examples
# To make markdown documentation
cd docs
make markdown
```
