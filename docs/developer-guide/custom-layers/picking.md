# Picking

> Make sure you have read [Interactivity](/docs/developer-guide/interactivity.md) before reading this section.

## How It Works

### The Color Picking Technique

Rather than doing traditional ray-casting or building octrees etc in JavaScript, deck.gl implements picking on the GPU using a technique we refer to as "color picking". When deck.gl needs to determine what is under the mouse (e.g. when the user moves or clicks the pointer over the deck.gl canvas), all pickable layers are rendered into an off-screen buffer, but in a special mode activated by a GLSL uniform. In this mode, the shaders of the core layers render picking colors instead of their normal visual colors.

Each object in each layer gets its own picking color assigned. The picking color is determined using [`layer.encodePickingColor()`](/docs/api-reference/layer.md#-encodepickingcolor-) that converts the index of a object of a given layer into a 3-byte color array (the color buffer allows us to distinguish between 16M unique colors per layer, and between 256 different layers).

After the picking buffer is rendered, deck.gl looks at the color of the pixel under the pointer, and decodes it back to the index number using [`layer.decodePickingColor()`](/docs/api-reference/layer.md#-decodepickingcolor-).


### Event Propagation

Once an object is picked, deck.gl creates a [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) object that describes what is under the pointer.

The [`layer.getPickingInfo()`](/docs/api-reference/layer.md#-getpickinginfo-) method is called first on the layer that directly rendered the picked object, to modify or add additional fields to the info.

The info object is then passed to the `getPickingInfo()` of its parent layer, and then its grandparent, and so on. This is so that composite layers can further augment the `info` object after it is processed by the picked sublayer. This allows the composite layer to hide implementation details and expose only user-friendly information.

When the processing chain is over, the event is invoked on the top-level layer. This means that only the top-level layer's `on<Event>` callbacks are invoked, and the final picking info's `layer` field will point to the top-level layer. The idea is that the user should only interface with the layer that they created, and not having to know the underlying implementation.

When an event fires, the callback functions are executed in the following order:

- `layer.on<Event>` (default implementation invokes `this.props.on<Event>`)
- `layer.props.on<Event>` (only if the layer method is not defined)
- `deck.props.on<Event>`

If any of the callback functions return `true`, the event is marked handled and the rest of the callbacks will be skipped.


### Default Handling of Pointer Events

Whenever the pointer moves over the canvas, deck.gl performs a new picking pass, yielding a picking info object describing the result. This object is used for multiple purposes:

- The `onHover` callbacks are called with it
- To update the picked layer if [autoHighlight](/docs/api-reference/layer.md#autohighlight-boolean-optional) is enabled
- Saved for later use

When other gestures (click, drag, etc.) are detected, deck.gl does not repeat picking. Instead, their callbacks are called with the last picked info from `hover`.


## Implementing Custom Picking

> While deck.gl allows applications to implement picking however they want,
special support is provided for the built-in "picking color" based picking
system, which most layers use.

To take full control of picking, a layer need to take the following steps:

### Creating A Picking Color Attribute

Add an attribute for each vertex using the layer's [AttributeManager](/docs/api-reference/attribute-manager.md):

```js
import GL from '@luma.gl/constants';

class MyLayer extends Layer {
  initializeState() {
    this.state.attributeManager.add({
      customPickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        update: this.calculatePickingColors
      }
    });
  }
}
```

Populate the attribute by providing a different picking color for every object that you need to differentiate. The default implementation of [`layer.encodePickingColor()`](/docs/api-reference/layer.md#-encodepickingcolor-) and [`layer.decodePickingColor()`](/docs/api-reference/layer.md#-decodepickingcolor-) is likely sufficient, but you may need to implement your own pair.

```js
class MyLayer extends Layer {

  ...

  calculatePickingColors(attribute) {
      const {data} = this.props;
      const {value} = attribute;

      let i = 0;
      for (const object of data) {
        const pickingColor = this.encodePickingColor(i);
        value[i * 3] = pickingColor[0];
        value[i * 3 + 1] = pickingColor[1];
        value[i * 3 + 2] = pickingColor[2];
        i++;
      }
  }
}
```

By default, the `object` field of the picking `info` object is indexed from the layer's `data` prop. Custom layers often need to define on their own terms what constitutes meaningful information to the user's callbacks. A layer can achieve this by overriding [`layer.getPickingInfo()`](/docs/api-reference/layer.md#-getpickinginfo-) to add or modify fields to the `info` object.


### Model object creation

If your layer creates its own [Model](https://luma.gl/docs/api-reference/engine/model) object, add picking module to `modules` array.

```js
import {Model} from '@luma.gl/core';
import {picking} from '@deck.gl/core';

new Model(gl, {
  ...
  vs: CUSTOM_VS,
  fs: CUSTOM_FS,
  modules: [picking]
});
```

### Implementing Picking in Custom Shaders

All core layers (including composite layers) support picking using luma.gl's `picking module`. If you are using custom shaders with any of the core layers or building custom layers with your own shaders, the following steps are needed to enable picking:

#### Vertex Shader

Vertex shader should set current picking color using `picking_setPickingColor` method provided by picking shader module.

```glsl
attribute vec3 customPickingColors;

void main(void) {
  ...

  picking_setPickingColor(customPickingColors);
}
```

### Fragment Shader

Fragment shader should use `picking_filterPickingColor` to update `gl_FragColor`, which outputs picking color if it is the picking pass.

```glsl
void main(void) {
  ...

  // Should be the last Fragment shader instruction that updates gl_FragColor
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
```

For more details refer to luma.gl's [`Picking Module`](https://luma.gl/docs/api-reference/shadertools/core-shader-modules).
