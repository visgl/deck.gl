## Layer Lifecycle

If you are familiar with React and the
[React component lifecycle](https://facebook.github.io/react/docs/component-specs.html)
you will quickly understand the deck.gl layer lifecycle as it is built on
essentially the same set of methods.

## Properties and Methods

### `id` property

The `id` property is used to match layers. Every time you create a new layer
with the same `id` property as a layer you rendered last time,
those layers will be matched up and share the same state. We can consider the
new layer instance an "update" of the old instance.
It is similar to React's `key` property with these exceptions:
* 'id' is currently always required
* it also needs to be globally unique among all your layers.
Just make sure that every layer has a unique `id` property so that deck.gl
can match your new layers with previously rendered ones.

### Initialization: Layer.initializeState()

This method is called only once for each layer (as defined by the `id`
property), to set up the initial state for that layer.

deck.gl will already have created the `state` object at this time, and
added the `gl` context and the `attributeManager` context.


### Mounting: Layer.didMount()

Invoked once. Mainly used to separate out some code from `initializeState`.


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


### Finalization: Layer.willUnmount()

Called on layers from previous rendering cycle that did not get matched
with new layers. Called just before the reference to the state of that layer
is released.

This is the right time to destroy WebGL resources etc.



