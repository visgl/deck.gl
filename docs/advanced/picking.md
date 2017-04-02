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
to the index number using
[`layer.decodePickingColor()`](/docs/api-reference/base-layer.md#-decodepickingcolor-)
to determine which object of the layer has been picked.

A `hover` event is triggered on a layer if:
- The layer is picked, and the picked object is different from the last frame
- The layer is not picked, but it was in the last frame

A `click` event is triggered on a layer only if it's picked.

When an event is triggered,
[`layer.getPickingInfo()`](/docs/api-reference/base-layer.md#-getpickinginfo-)
is called on the affected layers to populate the `info` object of the event.
This object is then passed to the `onHover` and `onClick` callbacks.


## Event Propagation In Composite Layers

When a picking event is triggered, `getPickingInfo()` of the layer that rendered the
object is called first. The event then gets propagate to its parent layer, and so on.

Composite layers can further augment the `info` object after it is processed by
the picked sublayer. This allows the composite layer to hide implementation details
and expose only user-friendly information.

Only the `onHover` and `onClick` callbacks of the top-level layer is called. The idea
is that the user should only interface with the layer that they created, and not having
to know the underlying implementation.


## Implementing Custom Picking

> While deck.gl allows applications to implement picking however they want,
special support is provided for the built-in "picking color" based picking
system, which most layers use.

To take full control of picking, a layer need to take the following steps:

1. Add a picking color attribute during initialization:
  ```js
  initializeState() {

    ...

    this.state.attributeManager.add({
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors}
    });
  }
  ```
- Calculate the attribute by providing a different picking color for every object that
you need to differentiate, such as:
  ```js
  calculatePickingColors(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    
    let i = 0;
    for (const object of data) {
      const pickingColor = this.encodePickingColor(i);
      value[i++] = pickingColor[0];
      value[i++] = pickingColor[1];
      value[i++] = pickingColor[2];
    }
  }
  ```
- The default implementation of
[`layer.encodePickingColor()`](/docs/api-reference/base-layer.md#-encodepickingcolor-) and
[`layer.decodePickingColor()`](/docs/api-reference/base-layer.md#-decodepickingcolor-)
is likely sufficient, but you may need to implement your own pair.
- Support picking in shaders by rendering picking colors when `renderPickingBuffer`
is `1`, like [this example](/docs/advanced/writing-shaders.md#-float-renderpickingbuffer-).
- By default, the `object` field of the picking `info` object is indexed from
the layer's `data` prop. Custom layers often need to define on their own terms what 
constitutes meaningful information to the user's callbacks. A layer can achieve this 
by overriding
[`layer.getPickingInfo()`](/docs/api-reference/base-layer.md#-getpickinginfo-)
to add or modify fields to the `info` object.

