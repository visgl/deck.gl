# Picking

> Make sure you have read [Interactivity](/docs/get-started/interactivity.md) before reading this section.

## How It Works

Rather than doing traditional ray-casting or building octrees etc in JavaScript, deck.gl implements picking on the GPU using a technique we refer to as "color picking". When deck.gl needs to determine what is under the mouse (e.g. when the user moves or clicks the pointer over the deck.gl canvas), all pickable layers are rendered into an off-screen buffer, but in a special mode activated by a GLSL uniform. In this mode, the shaders of the core layers render picking colors instead of their normal visual colors.

Each object in each layer gets its own picking color assigned. The picking color is determined using a special encoding that converts the index of a object of a given layer into a 3-byte color array (the color buffer allows us to distinguish between 16M unique colors per layer, and between 256 different layers).

After the picking buffer is rendered, deck.gl looks at the color of the pixel under the pointer, and decodes it back to the index number using
[`layer.decodePickingColor()`](/docs/api-reference/layer.md#-decodepickingcolor-) to determine which object of the layer has been picked.

A `hover` event is triggered on a layer if:

* The layer is picked, and the picked object is different from the last frame
* The layer is not picked, but it was in the last frame

A `click` event is triggered on a layer only if it's picked.

When an event is triggered, [`layer.getPickingInfo()`](/docs/api-reference/layer.md#-getpickinginfo-) is called on the affected layers to populate the `info` object of the event. This object is then passed to the `onHover` and `onClick` callbacks.


## Event Propagation In Composite Layers

When a picking event is triggered, `getPickingInfo()` of the layer that rendered the object is called first. The event then gets propagate to its parent layer, and so on.

Composite layers can further augment the `info` object after it is processed by the picked sublayer. This allows the composite layer to hide implementation details and expose only user-friendly information.

Only the `onHover` and `onClick` callbacks of the top-level layer is called. The idea is that the user should only interface with the layer that they created, and not having to know the underlying implementation.


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

* Calculate the attribute by providing a different picking color for every object that you need to differentiate, such as:

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

* The default implementation of [`layer.encodePickingColor()`](/docs/api-reference/layer.md#-encodepickingcolor-) and [`layer.decodePickingColor()`](/docs/api-reference/layer.md#-decodepickingcolor-) is likely sufficient, but you may need to implement your own pair.
* By default, the `object` field of the picking `info` object is indexed from the layer's `data` prop. Custom layers often need to define on their own terms what  constitutes meaningful information to the user's callbacks. A layer can achieve this  by overriding [`layer.getPickingInfo()`](/docs/api-reference/layer.md#-getpickinginfo-) to add or modify fields to the `info` object.


## Implementing Picking in Custom Shaders

All core layers (including composite layers) support picking using luma.gl's `picking module`. If you are using custom shaders with any of the core layers or building custom layers with your own shaders following steps are needed to achieve `Picking`.

### Model object creation

When creating `Model` object, add picking module to `modules` array.

```js
new Model(gl, {
  ...
  vs: CUSTOM_VS,
  fs: CUSTOM_FS,
  modules: ['picking', ...]
});
```

### Vertex Shader

Vertex shader should set current picking color using `picking_setPickingColor` method provided by picking shader module.

```glsl
attribute vec3 instancePickingColors;

void main(void) {
  ...

  picking_setPickingColor(instancePickingColors);

  ....
}
```

### Fragment Shader

Fragment shader should use `picking_filterPickingColor` to update `gl_FragColor`, which outputs picking color if it is the picking pass.

```glsl
attribute vec3 instancePickingColors;

void main(void) {
  ...

  // Should be the last Fragment shader instruction that updates gl_FragColor
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
```

For more details refer to luma.gl's [`Picking Module`](http://uber.github.io/luma.gl/#/documentation/api-reference/shader-module).
