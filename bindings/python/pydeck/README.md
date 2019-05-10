# pydeck: A Python wrapper for deck.gl

[![Build Status](https://travis-ci.org/uber/deck.gl.svg?branch=master)](https://travis-ci.org/uber/deck.gl)

The pydeck module is a set of experimental Python bindings for deck.gl

For a quick example, install pydeck and try the following in a Jupyter notebook:
```python
UK_ACCIDENTS_DATA = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'
layer = pdk.Layer(
    'HexagonLayer',                 # Type of layer, see https://deck.gl/#/documentation/deckgl-api-reference/layers/overview
    UK_ACCIDENTS_DATA,              # URL for the data. Can also be a list of Python dictionaries.
    elevation_scale=50,             # Layer-specific parameters, e.g., range of hexagon bar height
    elevation_range=[0, 3000],      
    extruded=True,                 
    coverage=1)
# A viewport to zoom to
view_state = pdk.ViewState(
    longitude=-1.415,
    latitude=52.2323,
    zoom=6.6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.396)
r = pdk.Deck(layers=[layer], initial_view_state=view_state)
r.show()
```

For more, open the `examples/` directory in a Jupyter notebook.

## Installation

This package is not yet published on PyPI but you can install it locally.

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
