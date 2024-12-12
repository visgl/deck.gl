# @deck.gl/mapbox

This module integrates deck.gl into the Mapbox GL JS API-compatible ecosystem. 

- It synchronizes a deck.gl `MapView` with the [mapbox-gl camera](https://docs.mapbox.com/mapbox-gl-js/guides/#camera).
- It allows deck.gl to be used with mapbox-gl [controls](https://docs.mapbox.com/mapbox-gl-js/api/markers) and [plugins](https://docs.mapbox.com/mapbox-gl-js/plugins/) such as `NavigationControl`, `GeolocateControl` and `mapbox-gl-geocoder`.
- It adds the option to interleave deck.gl layers with the base map layers, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc.

This module may be used in the React, Pure JS, and Scripting Environments. Visit the [mapbox base map developer guide](../../developer-guide/base-maps/using-with-mapbox.md) for examples of each option.

When you use this module, Mapbox is the root HTML element and deck.gl is the child, with Mapbox handling all user inputs. Some of deck.gl's features are therefore unavailable due to limitations of mapbox-gl's API, see [limitations](#limitations). 

It may be easier to understand the concepts of the module if you are already a mapbox-gl developer.

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js'></script>
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

### Camera Syncronization between deck.gl and Mapbox

This module keeps a deck.gl `MapView` in sync with the mapbox-gl camera so that the base map and deck layers are always geospactially aligned. Some `Deck` props, such as `viewState`, are ignored or have different behavior. See `MapboxOverlay` constructor notes. Also, some camera features are unable to be fully synchronized due to mapbox-gl API limitations, see [limitations](#limitations).

### Using mapbox-gl controls and plugins with deck.gl

The Mapbox ecosystem offers many well-designed controls, from the basic functionalities of `NavigationControl`, `Popup` and `GeolocateControl`, to vendor-service-bound UI implementations such as `mapbox-gl-geocoder` and `mapbox-gl-directions`. These libraries require that the Mapbox Map holds the source of truth of the camera state, instead of the normal [state management](../../developer-guide/interactivity.md) by `Deck`. When you use the `MapboxOverlay` classes from this module, deck.gl plays nice with all the mapbox-gl peripherals.


### Mixing deck.gl layers and Mapbox layers

Some important information in the Mapbox map could be hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the Mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

To inject a deck layer into the Mapbox stack add an `interleaved: true` props to the [MapboxOverlay](./mapbox-overlay.md) control and add a `beforeId` prop to any layer passed to the [MapboxOverlay](./mapbox-overlay.md) control.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of Mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).


In some cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a Mapbox basemap, while seamlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and Mapbox layer catalogs. In this case, a `beforeId` is not needed.

#### Interleaved Renderer Compatibility

The following table details renderer support across different versions of mapbox-gl and maplibre-gl. See [base map renderers](../../get-started/using-with-map.md#base-maps-renderers) to learn about the differences between overlaid and interleaved renderers.

| Library                       | Overlaid (default) | Interleaved       |
|-------------------------------|--------------------|-------------------|
| mapbox-gl-js (before v2.13)   | ✓                  |                   |
| mapbox-gl-js v2.13+           | ✓                  | ✓ with `useWebGL2: true` |
| mapbox-gl-js v3+              | ✓                  | ✓                 |
| maplibre-gl-js (before v3)    | ✓                  |                   |
| maplibre-gl-js v3+            | ✓                  | ✓*                |

> *will fallback to WebGL1 if WebGL2 is not available

## Alternative Mapbox Integrations

If you're using deck.gl in a React or Scripting environment, you just want the base map as a back drop, and do not need mapbox-gl's UI controls or need to mix deck.gl and Mapbox layers, it is recommended that you do not use this module and instead use deck.gl as the root HTML element. Visit [Using Deck.gl as the root HTML element](../../developer-guide/base-maps/using-with-mapbox.md#reverse-controlled) for an example.

## Limitations

* When using deck.gl's multi-view system, only one of the views can match the base map and receive interaction. See [using MapboxOverlay with multi-views](./mapbox-overlay.md#multi-view-usage) for details.
* When using deck.gl as Mapbox layers or controls, `Deck` only receives a subset of user inputs delegated by `Map`. Therefore, certain interactive callbacks like `onDrag`, `onInteractionStateChange` are not available.
* Mapbox/MapLibre's terrain features are partially supported. When a terrain is used, the camera of deck.gl and the base map should synchronize, however the deck.gl data with z=0 are rendered at the sea level and not aligned with the terrain surface.
* Only Mercator projection is supported. Mapbox adaptive projection is not supported as their API doesn't expose the projection used.
* The `position` property in `viewState` has no equivalent in mapbox-gl.