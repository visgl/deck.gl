# pydeck: Beautiful maps with Python

![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)

pydeck is a set of Python bindings for making spatial visualizations with [deck.gl](https://deck.gl),
optimized for a Jupyter Notebook environment.

To get started, run

```bash
pip install pydeck
```

For more, open the `examples/` directory in a Jupyter notebook.

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

Run `npx webpack-dev-server` in the `modules/jupyter-widget`, which will enable hot-reloading at `localhost:8080`.

Finally, run `pip install -e .` for a development installation.

Additionally, `export PYDECK_DEVELOPMENT_SERVER=http://localhost:8080/index`

### Tests

Tests are handled by pytest.

```bash
pytest
```
