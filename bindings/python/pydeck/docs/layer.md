pydeck.Layer API Documentation
==========

## pydeck.Layer

```python
class pydeck.Layer(
    self,
    type,
    data,
    id=None,
    get_position='[lng, lat]',
    **kwargs)
```

Constructs a visualization layer from data for rendering on a map.

A catalog of available layers is viewable [here](https://github.com/uber/deck.gl/tree/master/docs/layers#deckgl-layer-catalog-overview).

Note that this is Javascript documentation and parameters in pydeck usually will be snake-cased according to Python convention.

**Also note that parameters change by layer**. Not all layers have all parameters. `get_position`, for instance, is on `ScatterplotLayer` but not `ArcLayer`. Be sure to refer to the deck.gl layer catalog.

#### Parameters

`type` : `str`

Type of layer to render, e.g., `HexagonLayer`. See the [layer catalog](https://github.com/uber/deck.gl/tree/master/docs/layers#deckgl-layer-catalog-overview).
    
`data` : `str` or `list` of `dict` or `pandas.DataFrame`

A URL of data to load in, a list of dictionaries, or a pandas.DataFrame to load into the visualization

`id` : `str`, default `None`

Unique name for the layer. Will autopopulate with a UUID if no ID is provided.

`get_position` : `str`, default `'[lng, lat]'`

Name of position field expressed as a coordinate pair, with some expression parsing, e.g., if `'[lng, lat]'` is provided, the position field will be assumed to be the common case where a flat file has separate columns `lat` and `lng`.

Note that this parameter does not work on all layers but will have some variant. See the [ArcLayer](https://deck.gl/#/examples/core-layers/arc-layer), which would not have a `get_position` in its constructor.

#### `get_position` Examples

Suppose you have a CSV as follows, where the location in the first field in the CSV (here, "coordinates")–

```csv
coordinates,classification
"[0.0, 0.0]",A
"[0.0, 0.0]",A
"[0.0, 1.0]",B
"[0.0, 1.0]",C
```

`get_position` here should be specified as `get_position='coordinates'`

If your coordinates are flattened, you want to specify you position as `get_position='[lng,lat]'`

```csv
lng,lat,classification
0.0,0.0,A
0.0,0.0,A
0.0,1.0,B
0.0,1.0,C
```

pydeck actually has a sophisticated string parser, borrowed from one in its parent library `deck.gl`. You can pass the expression `get_position=[lng + 1, lat * -1]` for example, which would shift each longitude by 1 and multiple each latitude by -1.

`**kwargs` : `int` or `str` or `float` or `bool` or `list`

Various other keyword arguments can be provided as well, provided they exist in the layer documentation.
For examples, `extruded=True` will extrude the underlying layer if this is a property it can have.
Fill color can be specified with `get_fill_color` as of RGBA values, e.g., `get_fill_color=[0, 0, 0]` for an all-black fill,
or as the name of a field of color values in the data, e.g., `get_fill_color='fill_color'`.

#### Returns

`pdk.Layer` : Layer object
