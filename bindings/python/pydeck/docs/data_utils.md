pydeck.data\_utils
=======

## pydeck.data\_utils.autocompute\_viewport

```python
def autocompute_viewport(
    points,
    view_proportion=1,
    viewport_type=pydeck.ViewState)
```

Automatically computes a zoom level for the points passed in.

#### Parameters
`points` : `list` of `list` of `float` or `pandas.core.frame`
    A list of points
`view_propotion` : `float`
    Proportion of the data that is meaningful to plot
`viewport_type` : `pydeck.ViewState`
    Class constructor for a viewport

#### Returns
    `pydeck.Viewport` : Viewport fitted to the data


## pydeck.data\_utils.assign\_random\_colors

Produces a lookup table keyed by each class of data, with value as an RGB array

This helps enable multi-class visualization in pydeck

```python
def assign_random_colors(data_vector)
```

#### Parameters

`data_vector` : `list`
    Vector of data classes to be categorized, passed from the data itself

#### Returns
    `collections.OrderedDict` : Dictionary of random RGBA value per class, keyed on class
