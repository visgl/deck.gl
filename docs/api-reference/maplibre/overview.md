# MapLibreOverlay

`MapLibreOverlay` renders deck.gl layers over MapLibre GL JS v6 using MapLibre's public APIs.

The module supports both [overlaid and interleaved](../../get-started/using-with-map.md#base-maps-renderers) rendering. Interleaved mode inserts deck.gl layers into the MapLibre style and shares its WebGL2 context.

## Installation

`@deck.gl/maplibre` is distributed as ES modules only.

```bash
npm install @deck.gl/maplibre maplibre-gl
```

`MapLibreOverlay` is also available as `deck.MapLibreOverlay` in the standalone `deck.gl` bundle.

Bundled applications must configure the MapLibre worker. The example below uses Vite. See the [MapLibre installation guide](https://maplibre.org/maplibre-gl-js/docs/#installation) for other bundlers. Direct browser ES module imports configure the worker automatically.

## Example

```ts
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {ScatterplotLayer} from '@deck.gl/layers';
import {Map, setWorkerUrl} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const map = new Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0.45, 51.47],
  zoom: 11
});

await map.once('load');

map.addControl(new MapLibreOverlay({
  interleaved: true,
  layers: [
    new ScatterplotLayer({
      id: 'points',
      data: [{position: [0.45, 51.47]}],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0],
      getRadius: 1000
    })
  ]
}));
```

See [Using with MapLibre](../../developer-guide/base-maps/using-with-maplibre.md) for React usage and integration modes.

## Constructor

`MapLibreOverlay` implements MapLibre's `IControl` interface. It accepts the same properties as [`Deck`](../core/deck.md), except that MapLibre manages the camera, canvas size, and interaction controller.

`width`, `height`, `parent`, `canvas`, `gl`, `viewState`, `initialViewState`, and `controller` cannot be supplied. `useDevicePixels` and `device` are ignored in interleaved mode because MapLibre owns the shared canvas and rendering context.

### interleaved

If `false`, deck.gl renders to a separate canvas over the map. If `true`, deck.gl layers share MapLibre's WebGL2 context and may be inserted into its style layer stack. The default is `false`.

This property is fixed when the overlay is constructed. To change rendering modes, remove the overlay and create another one.

### Layer ordering

In interleaved mode, add a `beforeId` property to a deck.gl layer to render it before a [MapLibre style layer](https://maplibre.org/maplibre-style-spec/layers/). Layers with the same `beforeId` are rendered together in their array order.

```ts
new ScatterplotLayer({
  id: 'points-under-labels',
  beforeId: 'waterway-label',
  data,
  getPosition: d => d.position
});
```

### Methods

- `setProps(props)` updates the underlying Deck properties. It cannot change `interleaved`.
- `pickObject`, `pickObjects`, and `pickMultipleObjects` forward to Deck's picking methods.
- `getCanvas()` returns MapLibre's canvas in interleaved mode and Deck's canvas otherwise.
- `finalize()` removes the control and releases its resources.

## Compatibility

- MapLibre GL JS v6 is supported.
- Interleaved mode currently supports MapLibre's WebGL2 renderer.
- Camera elevation is synchronized with or without terrain.
- Mercator is supported. Globe integration uses deck.gl's experimental [`GlobeView`](../core/globe-view.md).
- Non-default vertical field of view and camera roll are not synchronized.
- One interleaved overlay may be attached to a map.

Applications using MapLibre GL JS v4 or v5 can continue to use `MapboxOverlay` from `@deck.gl/mapbox`.
