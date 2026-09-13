# Picking

> Make sure you have read [Interactivity](../interactivity.md) before reading this section.

## How It Works

### The Color Picking Technique

Rather than doing traditional ray-casting or building octrees etc in JavaScript, deck.gl implements picking on the GPU using a technique we refer to as "color picking". When deck.gl needs to determine what is under the mouse (e.g. when the user moves or clicks the pointer over the deck.gl canvas), all pickable layers are rendered into an off-screen buffer, but in a special mode activated by a GLSL uniform. In this mode, the shaders of the core layers render picking colors instead of their normal visual colors.

Each object in each layer gets its own picking color assigned. The picking color is determined using [`layer.encodePickingColor()`](../../api-reference/core/layer.md#encodepickingcolor) that converts the index of a object of a given layer into a 3-byte color array (the color buffer allows us to distinguish between 16M unique colors per layer, and between 256 different layers).

After the picking buffer is rendered, deck.gl looks at the color of the pixel under the pointer, and decodes it back to the index number using [`layer.decodePickingColor()`](../../api-reference/core/layer.md#decodepickingcolor).


### Event Propagation

Once an object is picked, deck.gl creates a [picking info](../interactivity.md#the-pickinginfo-object) object that describes what is under the pointer.

The [`layer.getPickingInfo()`](../../api-reference/core/layer.md#getpickinginfo) method is called first on the layer that directly rendered the picked object, to modify or add additional fields to the info.

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
- To update the picked layer if [autoHighlight](../../api-reference/core/layer.md#autohighlight) is enabled
- Saved for later use

When other gestures (click, drag, etc.) are detected, deck.gl does not repeat picking. Instead, their callbacks are called with the last picked info from `hover`.


## Implementing Custom Picking

> While deck.gl allows applications to implement picking however they want,
special support is provided for the built-in "picking color" based picking
system, which most layers use.

The following sections describe common ways to implement custom picking.

### Default Instanced Picking

Instanced layer shaders can derive picking colors from the built-in instance id when each rendered instance maps to one picked object. In GLSL, use `picking_setPickingColorFromInstanceID()` or assign `geometry.pickingColor = picking_getPickingColorFromInstanceID()`. In WGSL, add `@builtin(instance_index)` to the vertex inputs and use `picking_getPickingColorFromIndex(instanceIndex)`.

Add an explicit picking index attribute only when the logical picking id within the current layer is different from the rendered instance id. For example:

* Binary GeoJSON or MVT point sublayers may render local point instances while picking should return a global feature index.

* `PathLayer` tessellates one path into multiple rendered segment or joint instances, so its generated geometry needs explicit picking indexes that map back to the source path index instead of each rendered segment's instance id.

### Creating A Picking Index Attribute

Add an attribute for each vertex or instance using the layer's [AttributeManager](../../api-reference/core/attribute-manager.md). Use the `rowIndexes` attribute name to let deck.gl handle deep-picking buffer mutation.

```js
class MyLayer extends Layer {
  initializeState() {
    this.state.attributeManager.add({
      rowIndexes: {
        size: 1,
        type: 'uint32',
        update: this.calculatePickingIndexes
      }
    });
  }
}
```

Populate the attribute by providing the logical object index for every rendered vertex or instance that you need to differentiate.

```js
class MyLayer extends Layer {

  ...

  calculatePickingIndexes(attribute) {
      const {data} = this.props;
      const {value} = attribute;

      let i = 0;
      for (const object of data) {
        value[i] = i;
        i++;
      }
  }
}
```

By default, the `object` field of the picking `info` object is indexed from the layer's `data` prop. Custom layers often need to define on their own terms what constitutes meaningful information to the user's callbacks. A layer can achieve this by overriding [`layer.getPickingInfo()`](../../api-reference/core/layer.md#getpickinginfo) to add or modify fields to the `info` object.


### Model object creation

If your layer creates its own [Model](https://github.com/visgl/luma.gl/blob/8.5-release/modules/engine/docs/api-reference/model.md) object, add picking module to `modules` array.

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

Vertex shader should set current picking color using helpers provided by the picking shader module.

```glsl
in float rowIndexes;

void main(void) {
  ...

  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
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

For more details refer to luma.gl's [`Picking Module`](https://github.com/visgl/luma.gl/blob/8.5-release/modules/shadertools/docs/api-reference/core-shader-modules.md#picking).
