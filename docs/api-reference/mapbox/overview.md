# @deck.gl/mapbox

This module makes it easy to use deck.gl as native layers and controls in the Mapbox and Maplibre GL JS ecosystem. 

> For brevity, the term 'mapbox-gl' will refer collectively to any library that is compatible with Mapbox GL JS, including but not limited to maplibre-gl. Known exceptions will be clearly marked. For more, see [Compatibility with Mapbox GL JS forks](../../developer-guide/base-maps/using-with-mapbox.md#compatibility-with-mapbox-gl-js-forks)

- It allows deck.gl to be used with other mapbox-gl controls such as `NavigationControl`, `GeolocateControl` and `mapbox-gl-geocoder`.
- You may choose to interleave deck.gl layers with the base map layers, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc.

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.js'></script>
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

One should note that this module is *not required* to use mapbox-gl as a base map for deck.gl. When you use this module, Mapbox is the root element and deck.gl is the child, with Mapbox handling all user inputs. Some of deck.gl's features are therefore unavailable due to limitations of mapbox-gl's API, see [limitations](#limitations) and [compatibility](#compatibility) below. If you just want the base map as a back drop, and do not need mapbox-gl's UI controls or mixing deck and Mapbox layers, it is recommended that you use deck.gl as the root element. Visit the [mapbox base map developer guide](../../developer-guide/base-maps/using-with-mapbox.md) for examples of each option.

It may be easier to understand the concepts of the module if you are already a mapbox-gl developer.

### Using mapbox-gl controls with deck.gl

The Mapbox ecosystem offers many well-designed controls, from the basic functionalities of `NavigationControl`, `Popup` and `GeolocateControl`, to vendor-service-bound UI implementations such as `mapbox-gl-geocoder` and `mapbox-gl-directions`. These libraries require that the Mapbox Map holds the source of truth of the camera state, instead of the normal [state management](../../developer-guide/interactivity.md) by `Deck`. When you use the `MapboxOverlay` or `MapboxLayer` classes from this module, deck.gl plays nice with all the mapbox-gl peripherals.


### Mixing deck.gl layers and Mapbox layers

One major use case for interleaving deck.gl and Mapbox is that some important information in the Mapbox map could be hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the Mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

To inject a deck layer into the Mapbox stack add a `beforeId` prop to any layer passed to the [MapboxOverlay](./mapbox-overlay.md) control.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of Mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).


In some cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a Mapbox basemap, while seamlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and Mapbox layer catalogs. In this case, a `beforeId` is not needed.

## Compatibility

Libraries utilizing WebGL1 cannot be interleaved with deck.gl. deck.gl has phased out support for WebGL1, requiring WebGL2 at a minimum. The following table details WebGL support across different versions of mapbox-gl and maplibre-gl.

| Library                       | WebGL Version   | Overlay Support | Interleaved Support |
|-------------------------------|-----------------|-----------------|---------------------|
| mapbox-gl (before v2.13)      | WebGL1          | Yes             | No                  |
| mapbox-gl-js v2.13+           | WebGL1 & WebGL2 | Yes             | Yes, with `useWebGl2` flag |
| mapbox-gl-js v3+              | WebGL2          | Yes             | Yes                 |
| maplibre-gl-js (before v3)    | WebGL1          | Yes             | No                  |
| maplibre-gl-js v3+            | WebGL2*         | Yes             | Yes                 |

> *will fallback to WebGL1 if WebGL2 is not available

## Limitations

* When using deck.gl's multi-view system, only one of the views can match the base map and receive interaction. See [using MapboxOverlay with multi-views](./mapbox-overlay.md#multi-view-usage) for details.
* When using deck.gl as Mapbox layers or controls, `Deck` only receives a subset of user inputs delegated by `Map`. Therefore, certain interactive callbacks like `onDrag`, `onInteractionStateChange` are not available.
* Mapbox/Maplibre's terrain features are partially supported. When a terrain is used, the camera of deck.gl and the base map should synchronize, however the deck.gl data with z=0 are rendered at the sea level and not aligned with the terrain surface.

