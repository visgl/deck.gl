Publication checklist for pydeck
==========

Preferably run these commands in a virtual environment. Install pydeck from its source.
Build deck.gl from its source as well. If you're unsure how to do this, the README.md files for both.
This also assumes that you have pypi credentials to publish pydeck and NPM credentials to publish @deck.gl/juypter-widget.

1) Verify that there is a CDN-hosted release of @deck.gl/jupyter-widget for the standalone html template
within pydeck.

2) Verify that Deck object works on a fresh install from the source in the following
environments:

- `.show()` in a Jupyter Notebook
- `.to_html()` in a Jupyter Notebook
- `.show()` in Jupyter Lab
- `.to_html()` in Jupyter Lab
- `.to_html()` in a Python REPL

3) Bump the version number in `pydeck/_version.py`

4) Run the following commands to publish to the test.pypi environment:

```
rm -r ./dist/*  # If exists, clear out the current dist folder
pip install -e . --verbose
python setup.py sdist bdist_wheel
pip install twine  # If you have not installed twine
python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```

5) In a fresh virtualenv, install pydeck from test.pypi:

```
pip install -i https://test.pypi.org/simple/ pydeck=={{version}}
```

where `{{version}}` is your semantic version.

6) Verify that pydeck works from test.pypi in the same environments as above.

7) If everything appears to be working, publish to pypi.

```
twine upload dist/*
```

8) Verify again the pydeck installed from the main pypi works in the environment above.

9) Inform the deck.gl Slack channel that a new version of pydeck has been published.


Updating documentation
==========

The pydeck documentation has three main components

- The .md files in the pydeck directory.
- The .rst files in the pydeck directory under `docs/`.
- The binder examples, which are kept on the `binder` branch of this repository.
- Most critically, the docstrings in the Python code itself, which combined with the .rst files generates
the documentation at https://deckgl.readthedocs.io/en/latest/.

### Updating the binder branch

Align the binder branch in-line with what's on master:

```
git checkout master
git pull
git checkout binder
git merge binder
git push
```

The Dockerfile at the root of the deck.gl repository can be tested locally with the following code:

```bash
docker build -t test-binder:latest .
docker run -p 8888:8888 test-binder:latest jupyter notebook --ip 0.0.0.0
```

This is what Binder will be executing when running the examples.

Verify the current examples work at https://mybinder.org/v2/gh/uber/deck.gl/binder?filepath=examples
