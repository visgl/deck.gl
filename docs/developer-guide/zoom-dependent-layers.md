# Zoom-Dependent Layers

Map styles often change what is drawn as the camera zooms: coarse summaries at low zoom give way to finer ones, labels thin out, lines keep a readable width. The [MapLibre](https://maplibre.org/maplibre-style-spec/) and [Mapbox](https://docs.mapbox.com/style-spec/) style specs express this declaratively with layer `minzoom`/`maxzoom` and `["zoom"]` expressions. The two specs share the syntax used on this page.

deck.gl handles these effects efficiently. Zoom-dependent props such as `opacity` are uniforms, so they can be updated on every frame without regenerating attributes or re-running aggregation. The patterns below show how to achieve each effect with existing layer props and extensions.

| MapLibre / Mapbox style spec | deck.gl |
| --- | --- |
| Layer `minzoom` / `maxzoom` | [`visible` or `layerFilter`](#zoom-ranges) |
| `["interpolate", ["linear"], ["zoom"], ...]` on `*-opacity` | [`opacity` computed from zoom](#crossfading-between-zoom-bands) |
| `circle-radius`, `line-width`, `text-size` interpolated by zoom | [Size units and pixel bounds](#sizes-that-scale-with-the-map) |
| `filter` against a per-feature zoom | [`DataFilterExtension`](#per-feature-minimum-zoom) |
| GeoJSON source `cluster: true` | [Aggregation layers per zoom band](#clustering) |
| `text-allow-overlap`, `symbol-sort-key` | [`CollisionFilterExtension`](#label-collision) |
| `*-pitch-alignment`, `*-rotation-alignment` | `billboard` on [ScatterplotLayer](../api-reference/layers/scatterplot-layer.md#billboard), [IconLayer](../api-reference/layers/icon-layer.md#billboard) and [TextLayer](../api-reference/layers/text-layer.md#billboard) |

## Interpolating by zoom

A small helper reproduces the style spec's `["interpolate", ["linear"], ["zoom"], z0, v0, z1, v1, ...]`: linear between stops, clamped at both ends.

```ts
type ZoomStops = [zoom: number, value: number][];

function interpolateZoom(zoom: number, stops: ZoomStops): number {
  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i++) {
    const [z1, v1] = stops[i];
    if (zoom <= z1) {
      const [z0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (zoom - z0)) / (z1 - z0);
    }
  }
  return stops[stops.length - 1][1];
}
```

A `step` expression is the same with two stops at the same zoom, e.g. `[[5, 0], [5, 1]]`.

## Zoom ranges

The equivalent of `minzoom`/`maxzoom` is to hide a layer outside a range of zooms. Keep the layer in the layer list and toggle its `visible` prop rather than removing it, so its buffers and aggregation results survive (see [Favor layer visibility over addition and removal](./performance.md#favor-layer-visibility-over-addition-and-removal)):

```ts
new ScatterplotLayer({
  id: 'parcels',
  // Style spec semantics: minzoom is inclusive, maxzoom is exclusive
  visible: zoom >= 14 && zoom < 24
  // ...
});
```

Alternatively, a [`layerFilter`](../api-reference/core/deck.md#layerfilter) decides per viewport, so it works when several views show different zooms (e.g. a minimap). It is also applied during picking, and composite layers are filtered by the id of the top-level layer:

```ts
const ZOOM_RANGES: Record<string, [minZoom: number, maxZoom: number]> = {
  counties: [0, 8],
  parcels: [14, 24]
};

new Deck({
  // ...
  layerFilter: ({layer, viewport}) => {
    const range = ZOOM_RANGES[layer.id];
    return !range || (viewport.zoom >= range[0] && viewport.zoom < range[1]);
  }
});
```

## Crossfading between zoom bands

Hard cutoffs make layers pop in and out. To fade instead, compute each layer's `opacity` from the zoom and let neighboring bands overlap. The example below draws a sequence of [GridLayer](../api-reference/aggregation-layers/grid-layer.md)s whose cells get smaller as you zoom in, and switches to the raw points at street level:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapViewState} from '@deck.gl/core';
import {GridLayer} from '@deck.gl/aggregation-layers';
import {ScatterplotLayer} from '@deck.gl/layers';

type Point = {position: [number, number]};
type ZoomStops = [zoom: number, value: number][];

function interpolateZoom(zoom: number, stops: ZoomStops): number {
  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i++) {
    const [z1, v1] = stops[i];
    if (zoom <= z1) {
      const [z0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (zoom - z0)) / (z1 - z0);
    }
  }
  return stops[stops.length - 1][1];
}

const BANDS: {cellSize: number; opacity: ZoomStops}[] = [
  {cellSize: 16000, opacity: [[0, 1], [7, 1], [8, 0]]},
  {cellSize: 4000, opacity: [[7, 0], [8, 1], [9, 1], [10, 0]]},
  {cellSize: 1000, opacity: [[9, 0], [10, 1], [11, 1], [12, 0]]},
  {cellSize: 250, opacity: [[11, 0], [12, 1], [13, 1], [14, 0]]}
];

function getLayers(data: Point[], zoom: number) {
  const gridLayers = BANDS.map(({cellSize, opacity: stops}) => {
    const opacity = interpolateZoom(zoom, stops);
    return new GridLayer<Point>({
      id: `grid-${cellSize}`,
      data,
      getPosition: d => d.position,
      cellSize,
      gpuAggregation: true,
      opacity,
      visible: opacity > 0,
      pickable: opacity > 0.5
    });
  });
  const pointOpacity = interpolateZoom(zoom, [[13, 0], [14, 1]]);
  const pointLayer = new ScatterplotLayer<Point>({
    id: 'points',
    data,
    getPosition: d => d.position,
    radiusUnits: 'pixels',
    getRadius: 2,
    opacity: pointOpacity,
    visible: pointOpacity > 0,
    pickable: pointOpacity > 0.5
  });
  return [...gridLayers, pointLayer];
}

const INITIAL_VIEW_STATE: MapViewState = {longitude: -74, latitude: 40.7, zoom: 6};

const data: Point[] = await fetch('/path/to/points.json').then(resp => resp.json());

const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    deckInstance.setProps({layers: getLayers(data, viewState.zoom)});
  },
  layers: getLayers(data, INITIAL_VIEW_STATE.zoom)
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useCallback, useMemo, useState} from 'react';
import {DeckGL} from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';
import {GridLayer} from '@deck.gl/aggregation-layers';
import {ScatterplotLayer} from '@deck.gl/layers';

type Point = {position: [number, number]};
type ZoomStops = [zoom: number, value: number][];

function interpolateZoom(zoom: number, stops: ZoomStops): number {
  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i++) {
    const [z1, v1] = stops[i];
    if (zoom <= z1) {
      const [z0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (zoom - z0)) / (z1 - z0);
    }
  }
  return stops[stops.length - 1][1];
}

const BANDS: {cellSize: number; opacity: ZoomStops}[] = [
  {cellSize: 16000, opacity: [[0, 1], [7, 1], [8, 0]]},
  {cellSize: 4000, opacity: [[7, 0], [8, 1], [9, 1], [10, 0]]},
  {cellSize: 1000, opacity: [[9, 0], [10, 1], [11, 1], [12, 0]]},
  {cellSize: 250, opacity: [[11, 0], [12, 1], [13, 1], [14, 0]]}
];

function getLayers(data: Point[], zoom: number) {
  const gridLayers = BANDS.map(({cellSize, opacity: stops}) => {
    const opacity = interpolateZoom(zoom, stops);
    return new GridLayer<Point>({
      id: `grid-${cellSize}`,
      data,
      getPosition: d => d.position,
      cellSize,
      gpuAggregation: true,
      opacity,
      visible: opacity > 0,
      pickable: opacity > 0.5
    });
  });
  const pointOpacity = interpolateZoom(zoom, [[13, 0], [14, 1]]);
  const pointLayer = new ScatterplotLayer<Point>({
    id: 'points',
    data,
    getPosition: d => d.position,
    radiusUnits: 'pixels',
    getRadius: 2,
    opacity: pointOpacity,
    visible: pointOpacity > 0,
    pickable: pointOpacity > 0.5
  });
  return [...gridLayers, pointLayer];
}

const INITIAL_VIEW_STATE: MapViewState = {longitude: -74, latitude: 40.7, zoom: 6};

function App({data}: {data: Point[]}) {
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);
  const onViewStateChange = useCallback(({viewState}) => setZoom(viewState.zoom), []);
  const layers = useMemo(() => getLayers(data, zoom), [data, zoom]);

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      onViewStateChange={onViewStateChange}
      layers={layers}
    />
  );
}
```

  </TabItem>
</Tabs>

Things to keep in mind:

- **Aggregation runs once per band.** Aggregation layers bin in world space, so changing the zoom only changes uniforms. A band is re-aggregated only when its `data` or bin size changes, so pass the same `data` object every time.
- **Faded layers can still be picked.** `opacity` does not affect picking, so tie `pickable` (or `visible`) to the band as above, or cull with `layerFilter`.
- **Pick bin sizes by screen size.** A bin size that stays roughly `n` pixels wide in the middle of a band is `n * 156543 * cos(latitude) / 2 ** zoom` meters. Doubling the size for every zoom level makes each cell split into four when you zoom in one level.
- **Share buffers for large data.** Every layer uploads its own copy of the positions. For millions of points, supply the positions as [binary attributes](./performance.md#supply-attributes-directly) and pass the same buffer to every layer.
- **Color domains differ between bands.** Coarser cells hold larger counts, so each band's automatic color domain is different. Normalize the value (e.g. count per area) or set `colorDomain` if colors should mean the same thing across bands.
- **Transparency adds up.** Where two bands overlap at partial opacity, the result is lighter than either band at full opacity. Keep overlaps short, or use flat (non-extruded) layers so depth testing does not hide one band behind the other.
- **Opacity is per layer, not per view.** With multiple views at different zooms, compute the value for the main view, or use `layerFilter` for hard per-view cutoffs.

## Sizes that scale with the map

Map styles often interpolate a size exponentially with base 2, e.g. `"circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 10, 2, 20, 2048]`, so that a circle keeps its geographic size. In deck.gl, that is the default behavior of sizes in meters. Pixel bounds keep them legible at low zoom:

```ts
new ScatterplotLayer({
  // ...
  radiusUnits: 'meters',
  getRadius: 50,
  // Never draw smaller than 2px or larger than 40px, whatever the zoom
  radiusMinPixels: 2,
  radiusMaxPixels: 40
});
```

The same props exist for other layers, e.g. `widthUnits`/`widthMinPixels`/`widthMaxPixels` on [PathLayer](../api-reference/layers/path-layer.md) and `sizeUnits`/`sizeMinPixels`/`sizeMaxPixels` on [TextLayer](../api-reference/layers/text-layer.md) and [IconLayer](../api-reference/layers/icon-layer.md). For any other curve, compute `radiusScale`, `widthScale` or `sizeScale` from the zoom with `interpolateZoom`. These are uniforms, so no attributes are recalculated.

## Per-feature minimum zoom

Vector tiles often assign each feature the zoom at which it appears (e.g. major cities first, towns later) and styles filter on it. With the [DataFilterExtension](../api-reference/extensions/data-filter-extension.md), store that zoom per object and move the filter range with the camera. Only a uniform changes per frame, and `filterSoftRange` fades features in instead of popping them:

```ts
import {DataFilterExtension} from '@deck.gl/extensions';

new TextLayer({
  id: 'cities',
  data: cities,
  getText: d => d.name,
  getPosition: d => d.coordinates,
  // The zoom at which each city appears, e.g. derived from its population rank
  getFilterValue: d => d.minZoom,
  filterRange: [0, zoom],
  filterSoftRange: [0, zoom - 1],
  extensions: [new DataFilterExtension({filterSize: 1})]
});
```

## Clustering

A GeoJSON source with `cluster: true` groups points differently at each zoom level. In deck.gl, there are two ways to do this:

- **Aggregation layers per zoom band**, as in [Crossfading between zoom bands](#crossfading-between-zoom-bands). Each band is aggregated once, on the GPU, and zooming only changes opacity. This scales to millions of points.
- **Re-clustering on zoom** in a custom composite layer that returns `changeFlags.viewportChanged` from `shouldUpdateState` and rebuilds clusters when the integer zoom changes. This fits icon or label clusters that need an exact count per cluster. See the [IconLayer example](https://github.com/visgl/deck.gl/tree/master/examples/website/icon), which uses [supercluster](https://github.com/mapbox/supercluster).

## Label collision

Symbol layers hide overlapping symbols by default and prioritizes them with `symbol-sort-key`. The [CollisionFilterExtension](../api-reference/extensions/collision-filter-extension.md) does the same on the GPU for any layer. Collisions are re-evaluated as the camera moves, so labels thin out automatically when zooming out:

```ts
import {CollisionFilterExtension} from '@deck.gl/extensions';

new TextLayer({
  id: 'labels',
  data: cities,
  getText: d => d.name,
  getPosition: d => d.coordinates,
  // Larger values win
  getCollisionPriority: d => d.population,
  extensions: [new CollisionFilterExtension()]
});
```
