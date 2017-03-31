# Picking

## How It Works

When the user moves or clicks the pointer over the deck.gl canvas, all pickable
layers are rendered into an off-screen buffer with the uniform:
[`renderPickingBuffer`](/docs/writing-shaders.md#-float-renderpickingbuffer-)
set to `1`. In this mode, the default implementation of the core layers
render using `pickingColor` or `instancePickingColor` attributes instead of
their normal color calculation.

The `pickingColor` is a special encoding that converts the index of a object
of a given layer into a 3-byte color array. When the picking buffer is rendered,
deck.gl looks at the color of the pixel under the pointer, and decodes it back
to the index number to determine which object has been picked.


## Layer Picking Methods

Picking can be controlled by overriding the following functions.

Note: 
While deck.gl allows applications to implement picking however they want,
special support is provided for the built-in "picking color" based picking
system, which most layers use.

##### nullPickingColor()

Returns the "null" picking color which is equal the the color of pixels
not covered by the layer. This color is guaranteed not to match any index value
greater than or equal to zero.

##### encodePickingColor(index)

- `index`: Integer 

Returns a color that encodes the supplied "sub-feature index" number.
This color can be decoded later using `Layer.decodePickingColor`.

To get a color that does not correspond to any "sub-feature", use
`Layer.nullPickingColor`.

Notes:
* indices to be encoded must be integers larger than or equal to 0.
* Picking colors are 24 bit values and can thus encode up to 16 million indices.

##### decodePickingColor(color)

- `color`: Array of 3 numbers [r, g, b].

Returns the number that was used to encode the supplied picking color.
See `Layer.encodePickingColor`. The null picking color (See
`Layer.nullPickingColor`) will be decoded as -1.

Note: The null picking color is returned when a pixel is picked that is not
covered by the layer, or when they layer has selected to render a pixel
using the null picking color to make it unpickable.

##### getPickingInfo(pickParams)

- `pickParams.info`: the current `info` object. By default it contains the
following fields:
  + `x`: mouse position x relative to the viewport.
  + `y`: mouse position y relative to the viewport.
  + `lngLat`: mouse position in world coordinates. Only applies if
    `layer.props.projectionMode` is `COORDINATE_SYSTEM.LNGLAT`.
  + `color`: the color of the pixel that is being picked. It represents a
    "picking color" that is encoded by
    [`layer.encodePickingColor()`](/docs/writing-layers/picking.md#layer-picking-methods).
  + `index`: the index of the object that is being picked. It is the returned
    value of
    [`layer.decodePickingColor()`](/docs/writing-layers/picking.md#layer-picking-methods).
  + `picked`: `true` if `index` is not `-1`.
- `pickParams.mode`: one of `hover` and `click`
- `pickParams.sourceLayer`: a composite layer can refer to the `sourceLayer` argument
for the sublayer instance where this event originates from.

This method should return an object with optional fields about
what was picked. This `info` object is then passed to the layer's `onHover`
or `onClick` callbacks.

If this method returns `null`, the corresponding event is cancelled and no callback
functions will be called.

The default implementation populates the `info` object with an `object` field
that is indexed from `layer.props.data`.


##### calculateInstancePickingColors()

A default picking colors attribute generator that is used for most
instanced layers. It simply sets the picking color of each instance to
the colors that directly encodes the the index of the instance in the
`data` property.


## Event Propagation In Composite Layers

When a picking event is triggered, `getPickingInfo()` of the layer that rendered the
object is called first. The event then gets propagate to its parent layer, and so on.

Composite layers can further augment the `info` object after it is processed by
the picked sublayer. This allows the composite layer to hide implementation details
and expose only user-friendly information.

Only the `onHover` and `onClick` callbacks of the top-level layer is called. The idea
is that the user should only interface with the layer that they created, and not having
to know the underlying implementation.


