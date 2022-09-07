# pydeck-carto

Pydeck wrapper for use with CARTO

## Install

```bash
pip install pydeck-carto
```

This also ensures [pydeck](https://pydeck.gl/) is installed. If you haven't previously enabled pydeck to be used with Jupyter, follow [its instructions](https://pydeck.gl/installation.html) to install.

### Installing from source

```bash
git clone https://github.com/visgl/deck.gl
cd deck.gl/bindings/pydeck-carto
pip install .
```

## Usage

For an example, see the [`examples/hello_world.ipynb`](./examples/basic-examples/hello_world.ipynb) Jupyter Notebook.

## Development

Make commands:

- init: create the environment and install dependencies
- lint: run linter (black + flake8)
- test: run tests (pytest)
- publish-pypi: publish package in pypi.org
- publish-test-pypi: publish package in test.pypi.org
- clean: remove the environment
