# @deck.gl/mapbox

This module makes it easy to use deck.gl as native layers and controls in the Mapbox GL JS ecosystem. 

- It allows deck.gl to be used with other mapbox-gl controls such as `NavigationControl`, `GeolocateControl` and `mapbox-gl-geocoder`.
- You may choose to interleave deck.gl layers with the base map layers, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc.

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.1.0/dist.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.js'></script>
<script type="text/javascript">
  const {MapboxOverlay} = deck;
</script>
```

### Install from NPM

```bash
npm install @deck.gl/mapbox
```

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
```


## Use Cases

One should note that this module is *not required* to use mapbox-gl as a base map for deck.gl. It is easier to understand the concepts of the module if you are already a mapbox-gl developer. Visit the [mapbox base map developer guide](/docs/developer-guide/base-maps/using-with-mapbox.md) for a complete list of your options.


### Mixing deck.gl layers and Mapbox layers

One major use case for interleaving deck.gl and Mapbox is that some important information in the Mapbox map could be hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the Mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

To inject a deck layer into the Mapbox stack, either:

- Create a [MapboxLayer](/docs/api-reference/mapbox/mapbox-layer.md) and call the [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API.
- Add a `beforeId` prop to any layer passed to the [MapboxOverlay](/docs/api-reference/mapbox/mapbox-overlay.md) control.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of Mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).


In some cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a Mapbox basemap, while seamlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and Mapbox layer catalogs. In this case, a `beforeId` is not needed.


### Using mapbox-gl controls with deck.gl

The Mapbox ecosystem offers many well-designed controls, from the basic functionalities of `NavigationControl`, `Popup` and `GeolocateControl`, to vendor-service-bound UI implementations such as `mapbox-gl-geocoder` and `mapbox-gl-directions`. These libraries require that the Mapbox Map holds the source of truth of the camera state, instead of the normal [state management](/docs/developer-guide/interactivity.md) by `Deck`. When you use the `MapboxLayer` or `MapboxOverlay` classes from this module, deck.gl plays nice with all the mapbox-gl peripherals.


## Limitations

* When using deck.gl's multi-view system, only one of the views can match the base map and receive interaction. See [using MapboxOverlay with multi-views](/docs/api-reference/mapbox/mapbox-overlay.md#multi-view-usage) for details.
* When using deck.gl as Mapbox layers or controls, `Deck` only receives a subset of user inputs delegated by `Map`. Therefore, certain interactive callbacks like `onDrag`, `onInteractionStateChange` are not available.
* WebGL2 based deck.gl features, such as attribute transitions and GPU accelerated aggregation layers cannot be used.
* Mapbox 2.0's terrain feature is currently not supported.

