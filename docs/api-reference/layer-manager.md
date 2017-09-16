# LayerManager Class (Advanced)

Note: The `LayerManager` class is an internal class that is exposed primarily to enable deck.gl to be used without React. If you are using the [`DeckGL`](/docs/api-reference/deckgl.md) React Component, a layer manager is created under the hood to handle layer management, and you do not need to use this class.

The `LayerManager` class handles updates, drawing and picking for a set of layers.

For more information consult the [Using Standalone](/docs/advanced/using-standalone.md) article.


## Constructor

Parameters:

- `opts` (Object)
  * `gl` ([WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext))

## Methods

##### `getLayers`

Returns an "expanded" list of layers, optionally be filtered by a list of layer ids. The list of layers is "expanded" in the sense that composite layers will have been recursively rendered and will thus only contain primitive layers. When supplying a layer id corresponding to a composite layer, all the sub layers rendered by that layer will be included.

`layerManager.getLayers({layerIds=[]})`

Parameters:

- `layerIds` (String[], optional) - A list of layer id strings. If supplied, the returned list will only contain layers whose `id` property matches (see note) one of the strings in the list.

Note: layer id matching checks that a layer id *starts with* one of the supplied strings. This ensures that sublayers rendered by a composite layer with the given id will also be included in the matched list.

##### `setViewport`

Parameters:

- `viewport` ([Viewport](/docs/api-reference/viewport.md)) - The new viewport

##### `setParameters`

Parameters:

- `parameters` (Object)
  * `useDevicePixelRatio` (Boolean) - Whether to use retina/HD display or not.

##### `updateLayers`

Parameters:

- `updateParams` (Object)
  * `newLayers` (Array) - Array of layers

##### `drawLayers`

Parameters:

- `drawParams` (Object)
  * `pass` (Number) - The render pass identifier, for debugging purpose

##### `pickLayers`

Parameters:

- `pickParams` (Object)
  * `x` (Number) - The x position of the pointer
  * `y` (Number) - The y position of the pointer
  * `mode` (String) - One of `hover` or `click`

## Source
[src/lib/layer-manager.js](https://github.com/uber/deck.gl/blob/4.1-release/src/lib/layer-manager.js)
