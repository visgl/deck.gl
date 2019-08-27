# pydeck: Beautiful maps with Python

![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)

Note that pydeck is under active development and not yet officially released. At the moment use of this library is experimental.

pydeck is a set of Python bindings for making spatial visualizations with [deck.gl](https://deck.gl),
optimized for a Jupyter Notebook environment.

To get started, run

```bash
pip install pydeck
```

## Installation

```bash
pip install -i https://test.pypi.org/simple/ pydeck
```

### Installation from source

```bash
# Clone the deck.gl repo
git clone https://github.com/uber/deck.gl/

# Navigate to the pydeck module
cd deck.gl/bindings/python/pydeck

# Create a virtual environment
virtualenv -p python3 env3
. env3/bin/activate

python setup.py install
```

## Development

First, run `yarn bootstrap` at the root of this repository.

Run `yarn watch` in the `modules/jupyter-widget` and in a separate terminal `export PYDECK_DEV_SERVER=http://localhost:8080`.

To specifiy a non-default URL for the webpack dev server, you can set a URL in the `PYDECK_DEV_SERVER` environment variable,
e.g., `export PYDECK_DEV_SERVER=http://localhost:8080`.

Finally, run `pip install -e .` for a development installation.


### Tests

Tests are handled by pytest.

```bash
pytest
```
