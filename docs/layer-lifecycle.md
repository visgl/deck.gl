## Layer Lifecycle

Every deck.gl layer subclass can define certain methods that get called
at certain points in its lifecycle. The layer can specify how its state
is initialized and finalized, if and how it should react to property changes,
and how it should draw and pick the layer.

The key to creating (and using) deck.gl layers in the most efficient way
is to understand how the `shouldComponentUpdate` and `willReceiveProps`
methods collaborate to minimize state updates, as long as they are fed the
right type of props.


## Comparison with React's Lifecycle

If you are familiar with React and the
[React component lifecycle](https://facebook.github.io/react/docs/component-specs.html)
you will quickly understand the deck.gl layer lifecycle as it is based on
similar ideas. In particular, experience with the React lifecycle should help
you understand how to leverage the `shouldUpdate` and `willReceiveProps`
methods.


## Properties and Methods

### `id` property

The `id` property is used to match layers. Every time you create a new layer
with the same `id` property as a layer you rendered last time,
those layers will be matched up and share the same state. Once matched
deck.gl consider the new layer instance an "update" of the old instance, and
the new matching layer will now have access to the `state` of the old layer.


### Initialization: Layer.initializeState()

This method is called only once for each layer (as defined by the `id`
property), to set up the initial state for that layer.

deck.gl will already have created the `state` object at this time, and
added the `gl` context and the `attributeManager` context.


### Finalization: Layer.finalizeSate()

Called on layers from previous rendering cycle that did not get matched
with new layers. Called just before the reference to the state of that layer
is released.

This is the right time to destroy WebGL resources etc.


### Updating: shouldUpdate(oldProps, newProps)

Called when a new layer has been matched with an old one. If this function
return false, willReceiveProps will never be called.
The default implementation essentially does a shallow equal comparison
on the props and returns false if no properties have changed.

There are some exceptions, the `deepEqual` prop and the `updateTriggers`
prop can be supplied additional checks. See the documentation of those
props in the Layer API.


### Updating: willReceiveProps(oldProps, newProps)

Called when a new layer has been matched with a layer from the previous
render cycle.

The default implementation, the attributeManager will be updated with the
new data prop which will cause attributes to update if it has changed, or
any of the updateTriggers have changed.


### Decomposing: renderSublayers()

Allows a layer to "render" one or more Layers passing in its own state as props.
The layers will be rendered after the rendering layer, but before the next
layer in the list. `renderSublayers` will be called on the new layers,
allowing a recursive decomposition of the drawing of a complex data set
into primitive layers.

A layer can return null, a single layer, or an array of layers. The default
implementation of `renderSublayers` returns null.


### Drawing: draw({uniforms})

The default implementation looks for a variable `model` in the layer's
state (which is expected to be an instance of the luma.gl `Model` class)
and calls `draw` on that model.

TBA


### Picking: getPickingModels()

The default implementation looks for a variable `model` in the layer's
state (which is expected to be an instance of the luma.gl `Model` class)
uses that model for picking.

TBD - this is not the best interface for enabling custom picking.

