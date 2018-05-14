# LayerManager Class (Internal)

> The `LayerManager` class is an internal class that apps normally would not want to use. It was initially exposed primarily to enable deck.gl to be used without React, however as of deck.gl v5.0 you are more likely to want to use the new `Deck` class (or the [`DeckGL`](/docs/api-reference/deckgl.md) React Component). Those classes create a `LayerManager` under the hood to handle layer management, and you do not need to use this class directly.

The `LayerManager` class handles updates, drawing and picking for a set of layers.

For more information consult the [Using Standalone](/docs/developer-guide/using-standalone.md) article.


## Constructor

Creates a new `LayerManager` instance.

```js
new LayerManager(gl, {eventManager: ...}})`
```

Parameters:

* `gl` ([WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext))


## Methods

##### `needsRedraw`

Checks if layers need to be redrawn.

```js
layerManager.needsRedraw({clearRedrawFlags = false});
```

Parameters:

* `clearRedrawFlags` (Bool) - Reset the needs redraw status

Returns:

* `true` if redraw is needed.

##### `getLayers`

Returns an list of layers, optionally be filtered by a list of layer ids.

```js
const layers = layerManager.getLayers({layerIds=[]});
```

Parameters:

* `layerIds` (String[], optional) - A list of layer id strings. If supplied, the returned list will only contain layers whose `id` property matches (see note) one of the strings in the list.

Returns: 

* `Layer[]` - array of layer instances.

Notes:

* The returned list of layers is "expanded" in the sense that composite layers will have been recursively rendered and the list will thus only contain primitive layers.
* When supplying the layer id of a composite layer, all the sub layers rendered by that layer will be included.
* layer id matching checks that a layer id *starts with* one of the supplied strings. This ensures that sublayers rendered by a composite layer with the given id will also be included in the matched list.


##### `setParameters`

Updates parameters.

```js
layerManager.setParameters({
	useDevicePixels,
    pickingRadius,
    onLayerClick,
    onLayerHover
});
```

Parameters:

* `useDevicePixels` (`Boolean`, optional) - Whether to use retina/HD display or not.
* `eventManager` - A source of DOM input events
* `pickingRadius` (`Number`, optional) - "Fuzziness" of picking (px), to support fat-fingering.
* `onLayerClick` (`Function`, optional) - A handler to be called when any layer is clicked.
* `onLayerHover` (`Function`, optional) - A handler to be called when any layer is hovered over.

Notes:

* The event "source" is expected to provide `on()`/`off()` methods for registration, and to call registered handlers with an "Event" object of the following shape:
  + `offsetCenter` (Object: {x, y}) - center of the event
  + `srcEvent` (Object) - native JS Event object


##### `setViews`

Updates the current views.

```js
layerManager.setViews(views);
```

Parameters:

* `views` (`View[]`) - The new [View](/docs/api-reference/view.md) instances.


##### `setLayers`

Provide a new list of layers. Layers will be matched against old layers, and any composite layers will be recursively expanded into primitive layers.

```js
layerManager.updateLayers({newLayers});
```

* `newLayers` (Layer[]) - Array of layers


##### `updateLayers`

Updates the current list of layers.


##### `drawLayers`

Draw all layers.

```js
layerManager.drawLayers({pass});
```

Parameters:

* `pass` (String) - The render pass identifier, for debugging purpose


##### `pickObject`

Pick the closest info at given coordinate.

```js
layerManager.pickLayer({x, y, mode, radius = 0, layerIds})
```

Parameters:

* `x` (Number) - The x position of the pointer
* `y` (Number) - The y position of the pointer
* `mode` (String) - One of `hover` or `click`

##### `pickObjects`

Get all unique infos within a bounding box.

```js
layerManager.queryLayer({x, y, width, height, layerIds});
```

Parameters:

* `x` (Number) - The x position of the pointer
* `y` (Number) - The y position of the pointer


## Source

[modules/core/src/core/lib/layer-manager.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/lib/layer-manager.js)
