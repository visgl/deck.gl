# pydeck: Beautiful maps with Python

![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)

Note that pydeck is under active development and not yet officially released. At the moment use of this library is experimental.

pydeck is a set of Python bindings for making spatial visualizations with [deck.gl](https://deck.gl),
optimized for a Jupyter Notebook environment.

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
virtualenv env
. env/bin/activate

python setup.py install
```

## Development

Install pydeck from its source as above.

To install the Jupyter extension in [JupyterLab](https://jupyterlab.readthedocs.io/en/stable/), you can run:

```bash
jupyter labextension install .
```

For classic notebook, you can run:

```bash
jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
jupyter nbextension enable --sys-prefix --py pydeck
```

To test the Python module, run:

```bash
pytest
```
