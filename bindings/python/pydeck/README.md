# pydeck: A Python wrapper for deck.gl

The pydeck module is a set of experimental Python bindings for deck.gl

For a quick example, install pydeck and try the following in a Jupyter notebook:

![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)

For more, open the `examples/` directory in a Jupyter notebook.

## Installation

This library will be released on PyPI shortly.

For now, you are free to install the test version of this library:

```bash
pip install -i https://test.pypi.org/simple/ pydeck
```

You can also install from the source as follows:

```bash
# Clone the deck.gl repo
git clone https://github.com/uber/deck.gl/

# Navigate to the pydeck module
cd deck.gl/bindings/python/pydeck

# Create a virtual environment
virtualenv env
. env/bin/activate

python setup.py install
```

## Development

Clone and install pydeck as above.

To install the Jupyter extension, you can run:

```
jupyter labextension install .
```

For classic notebook, you can run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
jupyter nbextension enable --sys-prefix --py pydeck
```

To test the Python module, run:

```bash
pytest
```
