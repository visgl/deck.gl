pydeck.Layer API Documentation
==========

## pydeck.Layer

```python
class pydeck.Layer(
    self,
    type,
    data,
    id=None,
    get_position='-',
    **kwargs)
```

Constructs a geospatial layer for plotting.

A catalog of available layers is viewable [here](https://github.com/uber/deck.gl/tree/master/docs/layers#deckgl-layer-catalog-overview).
Note that this is Javascript documentation and parameters in pydeck usually will be snake-cased according to Python convention.

#### Parameters

`type` : `str`
    Type of layer to render, e.g., `HexagonLayer`. See the layer catalog above.
`data` : `str` or `list` of `dict` or `pandas.DataFrame`
    A URL of data to load in, a list of dictionaries, 
`id` : `str`, default `None`
    Unique name for the layer. Will autopopulate with a UUID if no ID is provided.
`get_position` : `str`, default `'-'`
    Name of position field. If `'-'` is provided, the position field will be assumed to be the common case where a flat file has separate columns `lat` and `lng`.
`**kwargs` : `int` or `str` or `float` or `bool` or `list`
    Various other keyword arguments can be provided as well, provided they exist in the layer documentation.
    For examples, `extruded=True` will extrude the underlying layer if this is a property it can have.
    Fill color can be specified with `get_fill_color` as of RGBA values, e.g., `get_fill_color=[0, 0, 0]` for an all-black fill,
    or as the name of a field of color values in the data, e.g., `get_fill_color='fill_color'`.

#### Returns
    `pdk.Layer` : Layer object
