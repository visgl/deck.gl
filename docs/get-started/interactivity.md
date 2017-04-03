# Adding Interactivity

## Overview

deck.gl layers support two mouse events: `hover` and `click` in a process
called *picking*. Picking can be enabled or disabled on a layer-by-layer basis.

To enable picking on a layer, set
its [`pickable`](/docs/api-reference/base-layer.md#-pickable-boolean-optional-) prop to `true`.
This value is `false` by default.

There are two ways to subscribe to picking events:

- Set callback for each pickable layer by
setting [`onHover`](/docs/api-reference/base-layer.md#-onhover-function-optional-)
and [`onClick`](/docs/api-reference/base-layer.md#-onclick-function-optional-) props:
```js
const layer = new ScatterplotLayer({
    ...
    pickable: true,
    onHover: info => console.log('Hovered:', info),
    onClick: info => console.log('Clicked:', info)
});
```
- Set callback for all pickable layers by
setting [`onLayerHover`](/docs/api-reference/deckgl.md#-onlayerhover-function-optional-)
and [`onLayerClick`](/docs/api-reference/deckgl.md#-onlayerclick-function-optional-)
props of the `DeckGL` canvas:
```js
<DeckGL
    ...
    onLayerHover={this._onHover}
    onLayerClick={this._onClick}
/>
```

## Notes On Behavior

Picking events are triggered based on *pickable objects*:
- A `click` event is triggered every time the pointer clicked on an object in
a pickable layer.
- A `hover` event is triggered every time the hovered object of a pickable
layer changes.

What constitutes an object is defined by each layer.
Usually, it is one of the data entries that is passed in via `prop.data`.
For example, in
[Scatterplot Layer](/docs/layers/scatterplot-layer.md), an object is an element
in the `props.data` array that is used to render one circle. In
[GeoJson Layer](/docs/layers/geojson-layer.md), an object is a GeoJSON feature
in the `props.data` feature collection that is used to render one
point, path or polygon.

When an event is fired, the `onHover` or `onClick` callback of the affected
layer is called first. If the callback returns a truthy value, the event is
marked as handled. Otherwise, the event will bubble up to the `DeckGL` canvas
and be visible to its `onLayerHover` and `onLayerClick` callbacks.


## The Picking Info Object

The callbacks for `hover` and `click` events are called with a single parameter
`info` which contains a variety of fields describing the mouse or touch event
and what was hovered.

- `info.layer`: the layer that this event originates from.
- `info.index`: the index of the object that is being picked.
- `info.object`: the object that is being picked. This may vary from layer to
layer.
- `info.x`: mouse position x relative to the viewport.
- `info.y`: mouse position y relative to the viewport.
- `info.lngLat`: mouse position in world coordinates. Only applies if
`layer.props.projectionMode` is `COORDINATE_SYSTEM.LNGLAT`.


> Layers can add additional fields to the picking `info` object. Check the
  documentation of each layer.


## Under The Hood

If you are using the core layers, all has been taken care of.

If you are implementing a custom layer, read more about
[how picking is implemented](/docs/advanced/picking.md).
