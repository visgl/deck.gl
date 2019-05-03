# pydeck: A Python wrapper for deck.gl

[![Build Status](https://travis-ci.org/uber/deck.gl.svg?branch=master)](https://travis-ci.org/uber/deck.gl)

Experimental Python bindings for deck.gl

A series of lightweight objects that can be combined to create a JSON blob that
is compliant with the deck.gl JSON API viewable in this repo at `modules/json`.

## Installation

This package is not yet published on PyPI but you can install it locally.

```bash
pip install -e .
```

## Development

Clone and install pydeck:

```bash
# Clone the deck.gl repo
git clone https://github.com/uber/deck.gl/

# Navigate to the pydeck module
cd deck.gl/bindings/python/pydeck

# Create a virtual environment
virtualenv env
. env/bin/activate

# Install dependencies and the library itself
pip install -r requirements.txt
pip install -r requirements-dev.txt
pip install .
```

To install the Jupyter extension,

When developing your extensions, you need to manually enable your extensions with the notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension install .
```

For classic notebook, you can run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
jupyter nbextension enable --sys-prefix --py pydeck
```

To test, run

```bash
pytest
```
