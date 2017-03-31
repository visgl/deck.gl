# Using Layers

## Rendering a Single Layer

Deck.gl is designed to allow you to take any data with which you can associate
positions, and easily render that data on a map using a deck.gl `Layer`. By
simply instantiating that layer's class, and passing in a set of `properties`
that would include the `data` itself, together with some `accessors` and `properties`
that the layer uses to build the visualization.

The `accessors` are functions that you supply to describe how the layer
should extract various values

The data would typically be
a list (e.g. Array) of objects, often parsed from a JSON or CSV formatted
data.

## Rendering Multiple Layers

deck.gl allows you to render multiple layers using the same or different data
sets. You simply provide an array of layer instances and deck.gl will render
them in order (and handle interactivity when hovering clicking etc).

This allows you to compose visualizations using several primitive layers.

## Available Layers

deck.gl provides a couple of different types of layers

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

## Layer Creation

Every time some state in your application that affects visualization changes,
you simply create new layer instances with updated properties and pass them to
deck.gl for rendering.

The constant creation and disposal of layer instances may seem wasteful,
however the creation and recycling of JavaScript objects is quite efficient
in modern JavaScript environments.


## Notable Layer Properties

### The id Property

It is used to ensure that new components are matched with their counterparts
from the previous rendering cycle. the `id` property defaults to the layer name
so if you only have a single layer of each type you may not need to supply it.

However as soon as you add multiple instances of a specific layer (say
two `ScatterplotLayer`s) their `id`s must be unique for each layer or deck.gl
will fail to match layers.

The `id` property is similar to the `key` property on React components.
However deck.gl relies on this property even more than React does.


### The data Property and Accessors

Every deck.gl layer takes a `data` property, which the application usually
sets to an array of JavaScript objects. When the layer is about to be
drawn on screen for the first time, the layer will traverse this array
and build up WebGL buffers that allow it to render the data very quickly.
These WebGL buffers are saved and matched with any future changes.

