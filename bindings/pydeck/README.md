[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/uber/deck.gl/binder)
[![Documentation Status](https://readthedocs.org/projects/deckgl/badge/?version=latest)](https://deckgl.readthedocs.io/en/latest/?badge=latest)
[![Anaconda-Server Badge](https://anaconda.org/conda-forge/pydeck/badges/version.svg)](https://anaconda.org/conda-forge/pydeck)

# pydeck: Large-scale interactive data visualization in Python

![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)

The pydeck library is a set of Python bindings for making spatial visualizations with [deck.gl](https://deck.gl),
optimized for a Jupyter Notebook environment.

For __interactive demos__, click the binder logo below:

[![Binder](https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0)](https://mybinder.org/v2/gh/uber/deck.gl/binder)


[See further documentation here.](https://deckgl.readthedocs.io/en/latest/)

## Installation

```bash
pip install pydeck
```

The library is available via conda as well:

```bash
conda install -c conda-forge pydeck
```

To install pydeck for Jupyter Notebook, run the following commands on your Jupyter server:

```bash
jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
jupyter nbextension enable --sys-prefix --py pydeck
```

To install pydeck for JupyterLab, run the following:

```bash
jupyter labextension install @jupyter-widgets/jupyterlab-manager
jupyter labextension install @deck.gl/jupyter-widget
```

### Mapbox API token

Like deck.gl, the pydeck library takes its basemap tiles from [Mapbox](http://mapbox.com/). Register with Mapbox, and you can [find your Mapbox access token here](https://account.mapbox.com/access-tokens/). The service is free until a certain level of traffic is exceeded.

You will need to inform pydeck about your key by setting an environment variable. In your terminal, run `export MAPBOX_API_KEY=<mapbox-key-here>`, which pydeck will read to use Mapbox basemaps. You can also refer to the pydeck docs to see how to pass the key as a variable.

## Getting started

The following code renders a visualization similar to the one above in a Jupyter notebook:

```python
import pydeck as pdk

# 2014 locations of car accidents in the UK
UK_ACCIDENTS_DATA = ('https://raw.githubusercontent.com/uber-common/'
                     'deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')

# Define a layer to display on a map
layer = pdk.Layer(
    'HexagonLayer',
    UK_ACCIDENTS_DATA,
    get_position=['lng', 'lat'],
    auto_highlight=True,
    elevation_scale=50,
    pickable=True,
    elevation_range=[0, 3000],
    extruded=True,                 
    coverage=1)

# Set the viewport location
view_state = pdk.ViewState(
    longitude=-1.415,
    latitude=52.2323,
    zoom=6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.36)

# Render
r = pdk.Deck(layers=[layer], initial_view_state=view_state)
r.to_html('demo.html')
```

If you're doing this outside a Jupyter environment, you can run:

```python
r.to_html('demo.html', notebook_display=False)
```

For more, check out the docs and Binder examples above.

### Debugging note

Currently, some errors in pydeck will only appear in your browser's developer console.
If a visualization fails to render, open the developer console.
Error handling will be expanded in future versions of pydeck.

### Issues

If you encounter an issue, file it in the [deck.gl issues page](https://github.com/uber/deck.gl/issues/new?assignees=&labels=question&template=question.md&title=)
and include your browser's console output, if any.


### Installation from source

```bash
# Clone the deck.gl repo
git clone https://github.com/uber/deck.gl/

# Navigate to the pydeck module
cd deck.gl/bindings/pydeck

# Create a virtual environment
python3 -m venv env3
. env3/bin/activate
```

## Development

From the directory of this README, set up the developer environment for pydeck:

```bash
make init
```

Development inside a virtual environment is preferred.

JupyterLab is the recommended environment for development testing with pydeck.
The `jupyter lab --watch` command can be used to provide hot reloading for development.

### Tests

Tests are handled by pytest. In the top-level pydeck directory, you can type:

```bash
pytest
```
