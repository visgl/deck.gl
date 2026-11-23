# LayerManager Class (Internal)

> The `LayerManager` class is gradually being refactor into a `ComponentManager` class and will be made part of the `lifecycle` directory. It is now an internal class, use the `Deck` class (or the [`DeckGL`](https://deck.gl/next/docs/api-reference/react/deckgl.md) React Component) which creates a `LayerManager` under the hood.

The `LayerManager` class manages a set of layers' lifecycle.

For more information consult the [Using Standalone](https://deck.gl/next/docs/get-started/using-standalone.md) article.

## Constructor[​](#constructor "Direct link to Constructor")

Creates a new `LayerManager` instance.

```
new LayerManager(gl, {eventManager: ...}})`
```

Parameters:

* `gl` ([WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext))

## Methods[​](#methods "Direct link to Methods")

#### `needsRedraw`[​](#needsredraw "Direct link to needsredraw")

Checks if layers need to be redrawn.

```
layerManager.needsRedraw({clearRedrawFlags = false});
```

Parameters:

* `clearRedrawFlags` (boolean) - Reset the needs redraw status

Returns:

* `true` if redraw is needed.

#### `getLayers`[​](#getlayers "Direct link to getlayers")

Returns an list of layers, optionally be filtered by a list of layer ids.

```
const layers = layerManager.getLayers({layerIds = []});
```

Parameters:

* `layerIds` (string\[], optional) - A list of layer id strings. If supplied, the returned list will only contain layers whose `id` property matches (see note) one of the strings in the list.

Returns:

* `Layer[]` - array of layer instances.

Notes:

* The returned list of layers is "expanded" in the sense that composite layers will have been recursively rendered and the list will thus only contain primitive layers.
* When supplying the layer id of a composite layer, all the sub layers rendered by that layer will be included.
* layer id matching checks that a layer id *starts with* one of the supplied strings. This ensures that sublayers rendered by a composite layer with the given id will also be included in the matched list.

#### `setLayers`[​](#setlayers "Direct link to setlayers")

Provide a new list of layers. Layers will be matched against old layers, and any composite layers will be recursively expanded into primitive layers.

```
layerManager.updateLayers({newLayers});
```

* `newLayers` (Layer\[]) - Array of layers

#### `updateLayers`[​](#updatelayers "Direct link to updatelayers")

Updates the current list of layers.

## Source[​](#source "Direct link to Source")

[modules/core/src/lib/layer-manager.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/lib/layer-manager.ts)
