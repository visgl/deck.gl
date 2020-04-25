# RFC: Layer Extension

* **Authors**: Xiaoji Chen
* **Date**: Dec 2018
* **Status**: Draft


## Overview

This is a proposal for adding/removing optional functionalities to a deck.gl layer on-demand.


## Motivation

As the deck.gl layers ecosystem grows, we see many feature requests as variations of some existing layer. One of deck.gl's core design goals is easily composible and extensible layers. Over the last few major releases we introduced features such as [Composite Layer](/docs/api-reference/composite-layer.md), [shader modules](https://github.com/visgl/luma.gl/blob/master/docs/developer-guide/shadertools/using-shader-modules.md), [shader injection](https://github.com/visgl/luma.gl/blob/master/dev-docs/RFCs/v6.0/shader-fragment-injection-rfc.md), etc. While they offer much flexibility to authors of custom layers, it is not quite accessible to the majority of our users.

To begin with, adding a feature to an existing core layer is no easy task. It usually involves modification to multiple steps in the layer lifecycle, e.g. adding new props, uniforms, declaring and generating new attributes, and injecting code into the shaders. It requires the author to understand the general WebGL render pipeline and GLSL, deck.gl's layer lifecycle and attribute management system, and sometimes luma.gl. This is outlined in our tutorial for [subclassed layers](/docs/developer-guide/subclassed-layers.md).

Secondly, because of the ad-hoc nature of layer customization, it is difficult to package and reuse an "extension" for other layers. This is apprent in the [kepler.gl repo](https://github.com/keplergl/kepler.gl/tree/master/src/deckgl-layers) where a custom version of every core layer must be created in order to override a simple default bahavior.

To mitigate this, we can of course add as many customizable functionalities to the base layer as possible. However, it is a major concern that inflating the base layer will sacrefice performance in return. Additional attributes takes CPU cycles to generate and memory to store. Larger shaders take longer to compile. WebGL1 has a restricting limit of 16 attributes per vertex shader, so adding attributes without the user asking for it will make the layer less extensible instead.


## Case Studies

### fp64

* Shader module: `project64` (replaces `project32`)

### Data Filter

See [Data Filter RFC](/dev-docs/RFCs/v6.0/data-filter-rfc.md)

Components:

* Props: `getFilterValue`, `filterRange`
* Shader module: `filter`
* Attributes: `instanceFilterValue`
* Shader injection:
  - Vertex shader: `filter_setVisibility(instanceFilterValue);`
  - Frament shader: `gl_FragColor = filter_filterColor(gl_FragColor);`

### Brushing

See [ArcBrushingLayer example](https://gist.github.com/Pessimistress/dc2becf3809c67dc443b4dbab1b9a46f#file-index-html-L128)

A generic version of this functionality would need the following components:

* Props: `enableBrush`, `brushRadius`
* Shader module: `brushing`
* Shader injection:
  - Vertex shader: `brush_setVisibility(instancePositions);`
  - Frament shader: `gl_FragColor = brush_filterColor(gl_FragColor);`
* Redraw when the pointer moves (Add mouse position to the layer context? To standard uniforms?)

## Proposal

### Layer Class Changes

Some changes to the base Layer class are needed to make a generic, reusable extension system work:

* Add official lifecycle methods `getShaders`, `createModels` that each layer must implement.
* Base layer handles the creation and deletion of models. Models need to be invalidated when extensions change.
* (Implemented in v7.1) Official `bufferLayout` support in attribute management. The `bufferLayout` state is used in PathLayer and PolygonLayer to describe the number of instance for each data object. Currently, `AttributeManager`'s auto-update feature always assumes 1:1 mapping between an instance and a data object. Without supporting variable layout, an extension will have to implement layer-specific updaters for these layers.

### New LayerExtension Class

Add a `LayerExtension` interface. All layer extensions should extend this class. It contains the following methods:

- `getShaders(shaders)` - called after a layer's own `getShaders`, a hook to inject additional modules/code into the shaders
- `initializeState(context, layer)` - called after a layer's own `initializeState`, a hook to add attributes and/or initial states.
  + `context` (Object) - same object passed to `layer.initializeState`.
  + `layer` (Layer) - the parent layer.
- `updateState(params, layer)` - called after a layer's own `updateState`, a hook to update layer state from props.
  + `params` (Object) - same object passed to `layer.updateState`.
  + `layer` (Layer) - the parent layer.
- `finalizeState(layer)` - called after a layer's own `finalizeState`, a hook to clean up resources
  + `layer` (Layer) - the parent layer.

### New extensions Prop

Add a new `extensions` prop to the base `Layer` class which accepts an array of `LayerExtension` objects.

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {Brushing, DataFilter} from '@deck.gl/layer-extensions';

const LAYER_EXTENSIONS = [
  new Brushing(),
  new DataFilter({size: 2})  // with options
];

new Deck({
  layers: [
    new ScatterplotLayer({
      extensions: LAYER_EXTENSIONS,
      // props for brushing
      enableBrush: false,
      // props for filtering
      getFilterValue: d => [d.time, d.count],
      filterRange: [1545000000, 1545002000, 10, 20],
      ...
    })
  ]
})
```

The default value of `extensions` is `[]`.

Pros:

- Composite layers can directly pass extensions to sub layers
- Flat structure, easy to read

Challenges:

- The layers need to watch the extensions prop and recbuild their models if it changes.
- The layer cannot utilize the current propTypes system to apply fallback, validate or compare the new props added by an extension.


#### Alternative option: Higher-Order Layers

This is inspired by React's [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) concept.

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {brushing, filterable} from '@deck.gl/layer-extensions';

const BrushingFiterableScatterplotLayer = brushing(filterable(ScatterplotLayer, {size: 2}));

new Deck({
  layers: [
    new BrushingFiterableScatterplotLayer({
      // props for brushing
      enableBrush: false,
      // props for filtering
      getFilterValue: d => [d.time, d.count],
      filterRange: [1545000000, 1545002000, 10, 20],
      ...
    })
  ]
});
```

When used, these extensions wrap the original layer and return a new class with the additional functionality.

Pros:

- The extension system can be implemented entirely independently from the core.

Cons:

- Composite layers are difficult to extend in this fashion. Sub layer classes need to be extended individually and overriden with `subLayerProps`.
- Using multiple extensions will wrap a layer in nested classes, making it harder to debug.

