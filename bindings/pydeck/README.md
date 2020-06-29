[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/uber/deck.gl/binder)
[![Documentation Status](https://readthedocs.org/projects/deckgl/badge/?version=latest)](https://pydeck.gl)
[![Anaconda-Server Badge](https://anaconda.org/conda-forge/pydeck/badges/version.svg)](https://anaconda.org/conda-forge/pydeck)
[![Downloads](https://pepy.tech/badge/pydeck/week)](https://pepy.tech/project/pydeck/week)

# pydeck: Large-scale interactive data visualization in Python

[![demo](https://user-images.githubusercontent.com/2204757/58838976-1538f400-8615-11e9-84f6-a2fe42bb300b.gif)](https://pydeck.gl/)

The pydeck library is a set of Python bindings for making spatial visualizations with [deck.gl](https://deck.gl),
optimized for a Jupyter environment. To get started, __[see the documentation](https://pydeck.gl/)__.

__[To install pydeck, see the instructions here](https://pydeck.gl/installation.html)__.

For __interactive demos__, click the binder logo below:

[![Binder](https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0)](https://mybinder.org/v2/gh/uber/deck.gl/binder)

## Sample code

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

If you're developing outside a Jupyter environment, you can run:

```python
r.to_html('demo.html', notebook_display=False)
```

__[See the gallery for more examples.](https://pydeck.gl/#gallery)__

### Issues and contributing

If you encounter an issue, file it in the [deck.gl issues page](https://github.com/visgl/deck.gl/issues/new?assignees=&labels=question&template=question.md&title=)
and include your browser's console output, if any.

If you'd like to contribute to pydeck, please follow the [deck.gl contribution guidelines](https://github.com/visgl/deck.gl/blob/master/CONTRIBUTING.md)
and the [pydeck development installation instructions](https://pydeck.gl/installation.html#development-notes).
