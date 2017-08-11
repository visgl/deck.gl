# CompositeLayer Class

The `CompositeLayer` class is a subclass of the [Layer Class](/docs/api-reference/base-layer.md), with its own implementation of certain [layer lifecycle methods](/docs/advanced/layer-lifecycle.md) to help create sublayers and handle events.

If you intend to implement a layer that generates other layers, it is recommended that you extend this class.

## Usage

Define a composite layer that renders a set of sublayers, one of them conditionally
```js
class MyCompositeLayer extends CompositeLayer {
  renderLayers() {
    return [
      this._renderGroupOfSubLayers(), // returns an array of layers
      this.props.showScatterplot && new ScatterplotLayer(...)
    ];
  }
}
```


## Methods

##### `draw`

A composite layer does not render directly into the WebGL context. The `draw` method inherited from the base class is therefore never called.

##### `renderLayers`

Allows a layer to "render" or insert one or more deck.gl layers after itself.
Called after a layer has been updated.

Returns:
- `null`, a single `Layer` instance, or a (nested) array of layers.

The default implementation of `renderLayers` returns `null`.

`renderLayers` can return a nested arrays with `null` values. deck.gl will automatically flatten and filter the array. See usage above.


##### `getPickingInfo`

Called when a sublayer is being hovered or clicked, after the `getPickingInfo`
of the sublayer has been called.
The composite layer can override or add additional fields to the `info` object
that will be passed to the callbacks.

Parameters:

- `pickParams` (Object)
  * `pickParams.info` (Object) - The current `info` object. By default it contains the
  following fields:
    + `x` (Number) - Mouse position x relative to the viewport.
    + `y` (Number) - Mouse position y relative to the viewport.
    + `lngLat` ([Number, Number]) - Mouse position in world coordinates. Only applies if
      [`projectionMode`](/docs/api-reference/base-layer.md#-projectionmode-number-optional-)
      is `COORDINATE_SYSTEM.LNGLAT`.
    + `color` (Number[4]) - The color of the pixel that is being picked. It represents a
      "picking color" that is encoded by
      [`layer.encodePickingColor()`](/docs/api-reference/base-layer.md#-encodepickingcolor-).
    + `index` (Number) - The index of the object that is being picked. It is the returned
      value of
      [`layer.dncodePickingColor()`](/docs/api-reference/base-layer.md#-decodepickingcolor-).
    + `picked` (Boolean) - `true` if `index` is not `-1`.
  * `pickParams.mode` (String) - One of `hover` and `click`
  * `pickParams.sourceLayer` (Layer) - the sublayer instance where this event originates from.

Returns:

- An `info` object with optional fields about what was picked.
This object will be passed to the layer's `onHover` or `onClick` callbacks.
- `null`, if the corresponding event should cancelled with no callback
functions called.

The default implementation returns `pickParams.info` without any change.

## Source
[src/lib/composite-layer.js](https://github.com/uber/deck.gl/blob/4.1-release/src/lib/composite-layer.js)
