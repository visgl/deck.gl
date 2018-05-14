# Layer Lifecycle

Every deck.gl layer subclass can define certain methods that get called
at certain points in its lifecycle. The layer can specify how its state
is initialized and finalized, if and how it should react to property changes,
and how it should draw and pick the layer.


## deck.gl Rendering Cycles

Internally, deck.gl sets up the animation loop and calls provided
callbacks on initial load and for each rendered frame.
When the deck.gl layer list is drawn to screen, it matches the new Layer
instances with the instances from the previous render call, uniquely identified
by their `id` property.
Every time you create a new layer with the same `id` property as a layer you
rendered last time, deck.gl consider the new layer instance an "update" of the
old instance.

`layer.state` is an object that is internal to an instance of a layer.
When a new layer instance is matched to an existing layer instance by `id`,
the state object of the old layer becomes accessible to the new layer.
Layers can use the state object to store persistent information cross rendering cycles.


## Layer Lifecycle Stages

### Initialization

Initialization happens only once for each layer that is being added, i.e. a layer from the
current rendering cycle whose `id` does not get matched with any layer in the previous
cycle.
[`layer.initializeState()`](/docs/api-reference/layer.md#-initializestate-) is called at
this stage.

At the end of initialization,
[`layer.updateState()`](/docs/api-reference/layer.md#-updatestate-) is called
before the first render.

### Updating

Updating happens when a new layer has been matched with a layer from the previous
rendering cycle (resulting in new props being passed to that layer),
or when context has changed and layers are about to be drawn.

[`layer.shouldUpdateState()`](/docs/api-reference/layer.md#-shouldupdatestate-)
is called to determine if the layer needs an update. The default implementation updates on prop and data changes, but not on viewport changes, so screen-space based layers may want to override this (see e.g. ScreenGridLayer).
Under more complicated circumstances, additional checks can be supplied through the
[`dataComparator`](/docs/api-reference/layer.md#-datacomparator-function-optional-)
prop.

If the layer does need to be updated,
[`layer.updateState()`](/docs/api-reference/layer.md#-updatestate-)
is called to perform any necessary operation before the layer is rendered.
This usually involves recalculating an attribute by calling
[`state.attributeManager.invalidate`](/docs/api-reference/attribute-manager.md#-invalidate-)
and updating uniforms by calling `model.setUniforms`.
By default, when `props.data` changes, all attributes are invalidated and recalculated.

A composite layer may use
[`compositeLayer.renderLayers()`](/docs/api-reference/composite-layer.md#-renderlayers-)
to insert one or more deck.gl layers after itself.
The generated layers will then be matched and updated,
allowing the decomposition of the drawing of a complex data set
into "primitive" layers.

### Rendering

Rendering happens during each rendering cycle to draw the layer to the WebGL context.

For primitive layers, [`layer.draw()`](/docs/api-reference/layer.md#-draw-)
is called at this stage, which invokes the layers' `model.render` calls.
For composite layers, `layer.renderLayers` is called to genrate sublayers.

### Picking

Happens when a pointer moves over or clicks on the deck.gl canvas.

[`layer.draw()`](/docs/api-reference/layer.md#-draw-) of all pickable layers
are called with special uniforms to draw into an off-screen picking buffer.

When a layer is picked,
[`layer.getPickingInfo()`](/docs/api-reference/layer.md#-getpickinginfo-)
is called to generate the `info` object of information about what has been picked.
This object is then passed to the `onHover` or `onClick` callbacks of the layer.

Read more about [how picking works](/docs/developer-guide/picking.md).

### Finalization

Happens for each layer that is being removed, i.e. a layer from the previous
rendering cycle whose `id` did not get matched with any layer in the current
cycle.
[`layer.finalizeState()`](/docs/api-reference/layer.md#-finalizestate-)
is called just before the reference to the state of that layer
is released.


## Comparison with React's Lifecycle

If you are familiar with React and the
[React component lifecycle](https://facebook.github.io/react/docs/component-specs.html)
you will quickly understand the deck.gl layer lifecycle as it is based on
similar ideas. In particular, experience with the React lifecycle should help
you understand property change management and how to use the
`shouldUpdateState` and `updateState` methods.

Still, there are a couple of notable differences between the lifecycle
methods provided by the two frameworks:

* deck.gl performs preliminary analysis on certain props and context and
  provides a `changeFlags` object to your `shouldUpdateState` and
  `updateState`.

* deck.gl's `updateState` method is called both on layer initialization and
  on when props or context is updated. This is different from React's
  `willReceiveProps` that is not called when the component is initially created,
  The deck.gl model avoids requiring the same property checks to be performed
  twice in both the constructor and `willReceiveProps`.

* deck.gl separates rendering into the `draw` and `renderLayers` methods,
  where React just needs `render`.

* deck.gl's `pick` and `pickInfo` methods have no correspondence in
  React's lifecycle.

**Note**: deck.gl uses a simpler component model than React.
  While React backs instance with a separate component, deck.gl just transfers
  the old layers' state objects to any new matched layers.

**Note**: the data prop, attribute props and the viewport context are
  central to deck.gl layers and get special handling. React is more generic
  and leaves the interpretation of most props to the component.
