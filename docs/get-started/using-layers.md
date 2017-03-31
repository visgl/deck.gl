# Using Layers

## Rendering a Single Layer

Deck.gl is designed to allow you to take any data with which you can associate
positions, and easily render that data on a map using a deck.gl `Layer`. By
simply instantiating that layer's class, and passing in a set of `properties`
that would include the `data` itself, together with some `accessors` and `properties`
that the layer uses to build the visualization.

The `accessors` are functions that you supply to describe how the layer
should extract various values

The data would typically be a list (e.g. Array) of objects, often parsed
from a JSON or CSV formatted data.

```
  <DeckGL layers={[
    new ScatterplotLayer({data: ...})
  ]}/>
```

When the layer is about to be drawn on screen for the first time,
the layer will traverse the `data` array and build up WebGL buffers that
allow the GPU to render a visualization of your data very quickly.
These WebGL buffers are saved and matched with any future changes.

## Rendering Multiple Layers

deck.gl allows you to render multiple layers using the same or different data
sets. You simply provide an array of layer instances and deck.gl will render
them in order (and handle interactivity when hovering clicking etc).

This allows you to compose visualizations using several primitive layers.

```
  <DeckGL layers={[
    new ScatterplotLayer({data: ...}),
    new LineLayer({data: ...}),
    new ArcLayer({data: ...}),
  ]}/>
```

The main concern when rendering more than one instance of a specific layer (say
two `ScatterplotLayer`s) is that their `id` props must be unique for each layer
or deck.gl will fail to match layers between render cycles.

```
  <DeckGL layers={[
    new ScatterplotLayer({id: 'big-points', data: ..., ...}),
    new ScatterplotLayer({data: 'small-points', data: ..., ...}),
  ]}/>
```

The `id` property is similar (but not identicaly) to the `key` property on
React components.


## Available Layers

### Base Layers

All deck.gl layers inherit from either the `Layer` or the `CompositeLayer` base
classes and the props of those layers are available to all layers (unless otherwise
documented). These are not layers that your application would instantiate directly,
but you need to be aware of them as many important capabilities of deck.gl layers are
implemented in and documented on these base layers.

## Core Layers

The so called "Core Layers" are a group of geospatial visualization focused layers,
intended to represent a small set of widely applicable data visualization building
blocks. The core layers are the most stable and supported deck.gl layers.

### Deprecated Layers

These are layers from an older releases that now have better counterparts.
They should not be used in new applications as they will be removed in future
deck.gl releases.

### Sample Layers

Deck.gl provides a number of sample layers in the examples folders intended to
illustrate various ideas and approaches to how layers can be designed. These
layers sometimes have documentation in the example code, but they are not
listed here in the official documentation.

## Layer Creation, Update and Destruction

Every time some state in your application that affects visualization changes,
you simply create new layer instances with updated properties and pass them to
deck.gl for rendering.

After matching your newly supplied layers with the layers you provided
in your previous call to deck.gl, the state of any old layers is copied to
the new layers, and the old layers are discarded by deck.gl.

The application does not have to be aware about this, as long as it keeps
rendering new layers with the same `id` they will be matched and the existing
state of that layer will be updated accordingly

The constant creation and disposal of layer instances may seem wasteful,
however the creation and recycling of JavaScript objects is quite efficient
in modern JavaScript environments, and this is very similar to how React
works where every render cycle generates a new tree of ReactElement instances,
so the model is proven.

The layer lifecycle is documented in detail in the section about writing layers.
