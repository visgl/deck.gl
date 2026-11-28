---
name: deckgl-layers
description: >-
  Build deck.gl visualizations with layers: picking a layer from the catalog,
  ids, the data prop, get* accessors, constant vs function accessors,
  updateTriggers, rendering with Deck or the React DeckGL component, picking,
  tooltips and normalized colors. Use when writing or reviewing deck.gl layer
  code in JavaScript, TypeScript or React.
---

# deck.gl layers

References: `docs/developer-guide/using-layers.md`,
`docs/developer-guide/interactivity.md`, `docs/api-reference/core/layer.md`,
`docs/api-reference/layers/`.

## Packages

- `@deck.gl/core`: `Deck`, views, controllers.
- `@deck.gl/layers`: Scatterplot, Line, Arc, Path, Polygon, GeoJson, Icon,
  Text, Bitmap, Column, PointCloud ...
- `@deck.gl/aggregation-layers`, `@deck.gl/geo-layers` (Tile, MVT,
  Tile3D, Terrain, H3 ...), `@deck.gl/mesh-layers`, `@deck.gl/extensions`.
- `@deck.gl/react` for `<DeckGL>`.

## A layer

```ts
import {ScatterplotLayer} from '@deck.gl/layers';

type Station = {name: string; passengers: number; coordinates: [number, number]};

const layer = new ScatterplotLayer<Station>({
  id: 'bart-stations',          // stable, unique id
  data: stations,               // Array, iterable, Promise or URL
  getPosition: d => d.coordinates,
  getRadius: d => Math.sqrt(d.passengers),
  getFillColor: [255, 200, 0],  // constant: applied to every object
  pickable: true
});
```

Rules:

- Creating layer instances every render is cheap; deck.gl diffs by `id`.
  Expensive work happens only when an `id` is new or props change.
- Accessors (`get*`) receive `(object, {index, data, target})`.
- deck.gl ignores a *new function* passed to an accessor. When the result of
  an accessor depends on outside state, declare it:

```ts
new ScatterplotLayer({
  ...,
  getFillColor: d => (d.id === selectedId ? [255, 0, 0] : [0, 0, 255]),
  updateTriggers: {getFillColor: [selectedId]}
});
```

- Changing `data` requires a new reference (shallow compare); mutating the
  array in place does nothing.

## Rendering

```ts
import {Deck} from '@deck.gl/core';
const deck = new Deck({
  initialViewState: {longitude: -122.4, latitude: 37.74, zoom: 11},
  controller: true,
  layers: [layer],
  getTooltip: ({object}) => object && object.name
});
deck.setProps({layers: [nextLayer]});
```

React: `<DeckGL initialViewState={...} controller layers={layers} getTooltip={...} />`.
Layers render in array order (later on top).

## Interactivity

- `pickable: true` per layer (default `false`).
- Per-layer `onHover(info, event)` / `onClick`, or Deck-level `onHover`,
  `onClick`, `getTooltip`.
- `info.object`, `info.index`, `info.layer`, `info.coordinate`.

## Colors

Default colors are 0–255 RGBA arrays. With `new Deck({normalizedColors: true})`
supported color props and accessors take 0–1 values instead; divide byte
values by 255 including alpha.
