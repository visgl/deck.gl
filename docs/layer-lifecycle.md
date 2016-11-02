## Layer Lifecycle

Every deck.gl layer subclass can define certain methods that get called
at certain points in its lifecycle. The layer can specify how its state
is initialized and finalized, if and how it should react to property changes,
and how it should draw and pick the layer.

## Properties and Methods

##### `id` property

The `id` property is used to match layers. Every time you create a new layer
with the same `id` property as a layer you rendered last time,
those layers will be matched up and share the same state. Once matched
deck.gl consider the new layer instance an "update" of the old instance, and
the new matching layer will now have access to the `state` of the old layer.

##### Initialization: Layer.initializeState()

This method is called only once for each layer (as defined by the `id`
property), to set up the initial state for that layer.

deck.gl will already have created the `state` object at this time, and
added the `gl` context and the `attributeManager` context.

##### Finalization: Layer.finalizeState()

Called on layers from previous rendering cycle that did not get matched
with new layers. Called just before the reference to the state of that layer
is released.

This is a good time to destroy any layer specific WebGL resources etc.

##### Updating: shouldUpdateState({props, oldProps, context, oldContext, changeFlags})

Called when a new layer has been matched with a layer from the previous
render cycle (resulting in new props being passed to that layer),
or when context has changed and layers are about to be drawn.

If this function return false, `updateState` will never be called.

The default implementation essentially does a shallow equal comparison
on the props and returns false if no properties have changed.

There are some exceptions, the `dataComparator` prop and the `updateTriggers`
prop can be supplied additional checks. See the documentation of those
props in the Layer API.

##### Updating: updateState({props, oldProps, context, oldContext, changeFlags})

Called when a new layer has been matched with a layer from the previous
render cycle (resulting in new props being passed to that layer),
or when context has changed and layers are about to be drawn.

For information about changeFlags, see `shouldUpdateState`

The default implementation will invalidate all attributeManager attributes
if any change has been detected to the `data` prop.

##### Decomposing: renderLayers()

Allows a layer to "render" or generate one or more deck.gl Layers
passing in its own state as props.
The layers will be rendered after the rendering layer, but before the next
layer in the list. `renderLayers` will be called on the new layers,
allowing the decomposition of the drawing of a complex data set
into "primitive" layers.

A layer can return null, a single layer, or an array of layers. The default
implementation of `renderLayers` returns null.

##### Drawing: draw({uniforms})

The default implementation looks for a variable `model` in the layer's
state (which is expected to be an instance of the luma.gl `Model` class)
and calls `draw` on that model.

##### Picking: pick({uniforms, deviceX, deviceY})

The pick method should return an object with optional fields about
what was picked. This `info` object is then populated with additional
information by deck.gl and finally passed to the layer's `onHover` or
`onPick` callbacks.

The default implementation looks for a variable `model` in the layer's
state (which is expected to be an instance of the luma.gl `Model` class)
uses that model for picking, and renders that model with attributes set
that allow the layer shaders to render picking colors instead of normal
colors.

### Comparison with React's Lifecycle

If you are familiar with React and the
[React component lifecycle](https://facebook.github.io/react/docs/component-specs.html)
you will quickly understand the deck.gl layer lifecycle as it is based on
similar ideas. In particular, experience with the React lifecycle should help
you understand property change management and how to use the
`shouldUpdateState` and `updateState` methods.

Still, there are a couple of notable differences between the lifecycle
methods provided by the two frameworks:

- deck.gl performs preliminary analysis on certain props and context and
  provides a `changeFlags` object to your `shouldUpdateState` and
  `updateState`.

- deck.gl's `updateState` method is called both on layer initialization and
  on when props or context is updated. This is different from React's
  `willReceiveProps` that is not called when the component is initially created,
  The deck.gl model avoids requiring the same property checks to be performed
  twice in both the constructor and `willReceiveProps`.

- deck.gl separates rendering into the `draw` and `renderLayers` methods,
  where React just needs `render`.

- deck.gl's `pick` and `pickInfo` methods have no correspondence in
  React's lifecycle.

**Note**: deck.gl uses a simpler component model than React.
  While React backs instance with a separate component, deck.gl just transfers
  the old layers' state objects to any new matched layers.

**Note**: the data prop, attribute props and the viewport context are
  central to deck.gl layers and get special handling. React is more generic
  and leaves the interpretation of most props to the component.
