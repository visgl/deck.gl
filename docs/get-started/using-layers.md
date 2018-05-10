# Visualizing Data through Layers

## Rendering a Single Layer

deck.gl is designed to allow you to take any data with which you can associate positions, and easily render that data on a map using a deck.gl `Layer`. By simply instantiating that layer's class, and passing in a set of `properties` that would include the `data` itself, together with some `accessors` and `properties` that the layer uses to build the visualization.

The `properties` are values that allow you to control how the layer
should render your data.

The `accessors` are functions that you supply to describe how the layer
should extract various values.

The data would typically be a list (e.g. Array) of objects, often parsed
from a JSON or CSV formatted data.

```js
<DeckGL layers={[
  new ArcLayer({data: ...})
]} />
```

When the layer is about to be drawn on screen for the first time, the layer will traverse the `data` array and build up WebGL buffers that
allow the GPU to render a visualization of your data very quickly. These WebGL buffers are saved and matched with any future changes.

## Rendering Multiple Layers

deck.gl allows you to render multiple layers using the same or different data sets. You simply provide an array of layer instances and deck.gl will render them in order (and handle interactivity when hovering clicking etc).

This allows you to compose visualizations using several primitive layers.

```js
<DeckGL layers={[
  new PathLayer({data: ...}),
  new LineLayer({data: ...}),
  new ArcLayer({data: ...}),
]} />
```

The main concern when rendering more than one instance of a specific layer (say two `ScatterplotLayer`s) is that their `id` props must be unique for each layer or deck.gl will fail to match layers between render cycles.

```js
<DeckGL layers={[
  new ScatterplotLayer({id: 'big-points', data: ..., ...}),
  new ScatterplotLayer({id: 'small-points', data: ..., ...}),
]} />
```

The `id` property works similarly (but not identically) to the `key` property on React components.

## Available Layers

All deck.gl layers inherit from either the [`Layer`](/docs/api-reference/layer.md) or the [`CompositeLayer`](/docs/api-reference/composite-layer.md) base classes and the props of those layers are available to all layers unless otherwise documented.

### Core Layers

[Browse deck.gl's layer catalog](/docs/layers/arc-layer.md)

The "core layers" are a group of geospatial visualization focused layers, intended to represent a small set of widely applicable data visualization building blocks. The core layers are the most stable and supported deck.gl layers.

### Sample Layers

deck.gl provides a number of sample layers in the [examples directory](https://github.com/uber/deck.gl/tree/5.2-release/examples/sample-layers) intended to illustrate various ideas and approaches to how layers can be designed. These layers have documentation in their respective folders, but they are not listed here in the official documentation.

## Layer Creation, Update and Destruction

Every time some state in your application that affects visualization changes, you simply create new layer instances with updated properties and pass them to deck.gl for rendering.

After matching your newly supplied layers with the layers you provided in your previous call to deck.gl, the state of any old layers is copied to the new layers, and the old layers are discarded by deck.gl.

The application does not have to be aware about this, as long as it keeps rendering new layers with the same `id` they will be matched and the existing state of that layer will be updated accordingly

The constant creation and disposal of layer instances may seem wasteful, however the creation and recycling of JavaScript objects is quite efficient in modern JavaScript environments, and this is very similar to how React works where every render cycle generates a new tree of ReactElement instances, so the model is proven.

For more details, read about [Layer Lifecycle](/docs/developer-guide/layer-lifecycle.md).
