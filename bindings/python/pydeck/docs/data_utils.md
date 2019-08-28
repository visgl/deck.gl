pydeck.data\_utils
=======

## pydeck.data\_utils.compute\_viewport

```python
def compute_viewport(
    points,
    view_proportion=1,
    viewport_type=pydeck.ViewState)
```

Computes a view state (zoom level and bounding box)
for the points passed in.

#### Parameters
`points` : `list` of `list` of `float` or `pandas.core.frame`
    A list of points
`view_propotion` : `float`
    Proportion of the data that will be viewable on the screen.
    Useful for filtering outlying points from a visualization.
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

#### Examples

See the PointCloudLayer notebook example, which uses many classes.

As an illustration below, with a smaller data set of only two classes and three rows:

```python
    import pandas
    data = pandas.DataFrame([
    	{
	    'site': 'Big Ben',
	    'attraction_type': 'Clock Tower',
	    'lat': 51.5006958,
	    'lng': -0.1266639
	},
	{
	    'site': 'Kensington Palace',
	    'attraction_type': 'Palace':
	    'lat': 51.5046188,
	    'lng': -0.1839472
	},
    	{
	    'attraction_type': 'Palace',
	    'site': 'Buckingham Palace',
	    'lat': 51.501364,
	    'lng': -0.14189
	}
    ])
    color_lookup = assign_random_colors(data['attraction_type'])
    # Assign a color based on attraction_type
    data['color'] = data.apply(lambda row: color_lookup.get(row['attraction_type']), axis=1)

    # Data now has a color by attraction type:
    #
    # [
    # 	{
    #         'site': 'Big Ben',
    #         'attraction_type': 'Clock Tower',
    #         'lat': 51.5006958,
    #         'lng': -0.1266639,
    #         'color': [0, 10, 35]
    #     },
    #     {
    #         'site': 'Kensington Palace',
    #         'attraction_type': 'Palace':
    #         'lat': 51.5046188,
    #         'lng': -0.1839472,
    #         'color': [53, 243, 130]
    #     },
    # 	{
    #         'attraction_type': 'Palace',
    #         'site': 'Buckingham Palace',
    #         'lat': 51.501364,
    #         'lng': -0.14189,
    #         'color': [53, 243, 130]
    #     }
    # ]
```
