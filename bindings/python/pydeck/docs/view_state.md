pydeck.ViewState API Documentation
=======

## pydeck.ViewState

```python
class ViewState(
    self,
    longitude=0.0,
    latitude=0.0,
    zoom=10,
    min_zoom=1,
    max_zoom=21,
    pitch=0,
    bearing=0,
    **kwargs)
```

An object that represents where the state of a viewport, essentially where the screen is focused.

If you have two dimensional data and you don't want to set this manually, see `pydeck.data_utils.viewport_helpers.autocompute_viewport`.

#### Parameters

`longitude` : `float`
    x-coordinate of focus
`latitude` : `float`
    y-coordinate of focus
`zoom` : `float`
    Magnification level of the map, usually between 0 (representing the whole world) and 21 (close to individual buildings)
`min_zoom` : `float`
    Least magnified zoom level the user can navigate to
`max_zoom` : float`
    Most magnified zoom level the user can navigate to
`pitch` : `float`
    Up/down angle relative to the map's plane, with 0 being looking directly at the map
`bearing` : `float`
    Left/right angle relative to the map's true north, with 0 being aligned to true north


#### Returns
    `pydeck.ViewState` : Object indicating location of map viewport
