# RFC: Layer Extension

* **Authors**: Xiaoji Chen
* **Date**: Dec 2018
* **Status**: Draft


## Overview

This is a proposal for adding/removing optional functionalities to a deck.gl layer on-demand.


## Motivation

As the deck.gl layers ecosystem grows, we see many feature requests as variations of some existing layer. One of deck.gl's core design goals is easily composible and extensible layers. Over the last few major releases we introduced features such as [Composite Layer](/docs/api-reference/composite-layer.md), [shader modules](https://github.com/uber/luma.gl/blob/master/docs/developer-guide/shadertools/using-shader-modules.md), [shader injection](https://github.com/uber/luma.gl/blob/master/dev-docs/RFCs/v6.0/shader-fragment-injection-rfc.md), etc. While they offer much flexibility to authors of custom layers, it is not quite accessible to the majority of our users.

To begin with, adding a feature to an existing core layer is no easy task. It usually involves modification to multiple steps in the layer lifecycle, e.g. adding new props, uniforms, declaring and generating new attributes, and injecting code into the shaders. It requires the author to understand the general WebGL render pipeline and GLSL, deck.gl's layer lifecycle and attribute management system, and sometimes luma.gl. This is outlined in our tutorial for [subclassed layers](/docs/developer-guide/subclassed-layers.md).

Secondly, because of the ad-hoc nature of layer customization, it is difficult to package and reuse an "extension" for other layers. This is apprent in the [kepler.gl repo](https://github.com/uber/kepler.gl/tree/master/src/deckgl-layers) where a custom version of every core layer must be created in order to override a simple default bahavior.

To mitigate this, we can of course add as many customizable functionalities to the base layer as possible. However, it is a major concern that inflating the base layer will sacrefice performance in return. Additional attributes takes CPU cycles to generate and memory to store. Larger shaders take longer to compile. WebGL1 has a restricting limit of 16 attributes per vertex shader, so adding attributes without the user asking for it will make the layer less extensible instead.


## Case Studies

### Picking

Components:

* Props: `pickable`, `autoHighlight`, `highlightedObjectIndex`, `highlightColor`
* Shader module: `picking`
* Attribute: `instancePickingColors` (generated regardless of the `pickable` setting)
* Shader injection:
  - Vertex shader: `picking_setPickingColor(instancePickingColors);`
  - Fragment shader: `gl_FragColor = picking_filterHighlightColor(gl_FragColor); gl_FragColor = picking_filterPickingColor(gl_FragColor);`

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
* Shader module: `brush`
* Shader injection:
  - Vertex shader: `brush_setVisibility(instancePositions);`
  - Frament shader: `gl_FragColor = brush_filterColor(gl_FragColor);`


## Proposal

### Layer Class

Some changes to the base Layer class are needed to make a generic, reusable extension system work:

* New interface that each sublayer must implement. During a layer update, these will be invoked by the base layer lifecycle instead of the current ad-hoc implementation:
  - `getShaders()`
  - `createModels(shaders)`
* New method that an extension can call:
  - `invalidateModels()`
* official `bufferLayout` (*API audit needed*) support in attribute management. The `bufferLayout` state is used in PathLayer and PolygonLayer to describe the number of instance for each data object. Currently, `AttributeManager`'s auto-update feature always assumes 1:1 mapping between an instance and a data object. Without supporting variable layout, an extension will have to implement layer-specific updaters for these layers.


### Idea 1: Higher-Order Layers

This is inspired by React's [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) concept.

```js
import {Deck, ScatterplotLayer} from 'deck.gl';
import {brushing, filterable} from '@deck.gl/layer-extensions';

const BrushingFiterableScatterplotLayer = brushing(filterable(ScatterplotLayer));

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


### Idea 2: Extensions Prop

Add a new `extensions` prop to the base `Layer` class which accepts an array of `LayerExtension` objects.

```js
import {Deck, ScatterplotLayer} from 'deck.gl';
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

The default value of `extensions` is `[new Picking()]`.

#### LayerExtension Class

The LayerExtension class is a partial implementation of a Layer:

* `static defaultProps = {}` - will be merged with the layer's default props.
* `getShaders()` - returns necessary shader modules and injections that will be merged with the layer's own
* `initializeState()` - called in addition to the layer's own
* `updateState()` - called in addition to the layer's own
