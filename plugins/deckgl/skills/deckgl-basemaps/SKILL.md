---
name: deckgl-basemaps
description: >-
  Put deck.gl layers on a base map: MapboxOverlay for Mapbox GL JS and
  MapLibre, GoogleMapsOverlay, overlaid vs interleaved rendering, beforeId and
  slot to draw under labels, and the react-map-gl useControl pattern. Use when
  combining deck.gl with Mapbox, MapLibre or Google Maps.
---

# deck.gl with a base map

References: `docs/get-started/using-with-map.md`,
`docs/api-reference/mapbox/mapbox-overlay.md`,
`docs/api-reference/maplibre/overview.md`,
`docs/api-reference/google-maps/google-maps-overlay.md`.

## Overlaid vs interleaved

- **Overlaid**: deck.gl draws on its own canvas above the map. Simple, but
  deck.gl content always sits above map labels.
- **Interleaved**: deck.gl draws into the map's WebGL context, so layers can
  sit between map layers (e.g. under labels) and share depth.

## Mapbox GL JS / MapLibre

```ts
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

map.once('load', () => {
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [
      new ScatterplotLayer({
        id: 'points',
        data,
        getPosition: d => d.position,
        getFillColor: [255, 0, 0, 100],
        getRadius: 1000,
        beforeId: 'waterway-label'   // Mapbox v3 Standard style: use slot: 'bottom'
      })
    ]
  });
  map.addControl(overlay);
});
```

`MapboxOverlay` implements the `IControl` API, so the same class works with
MapLibre GL JS. Update layers with `overlay.setProps({layers})`. The map owns
the camera; do not also pass `viewState` to deck.

## React (react-map-gl)

```tsx
import {Map, useControl} from 'react-map-gl/maplibre'; // or /mapbox
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {DeckProps} from '@deck.gl/core';

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

<Map initialViewState={...} mapStyle={style}>
  <DeckGLOverlay layers={layers} interleaved />
</Map>
```

## Google Maps

Use `GoogleMapsOverlay` from `@deck.gl/google-maps` and call
`overlay.setMap(map)`. Interleaved rendering needs a vector map (a Map ID).

## Checklist

- Follow the terms and attribution requirements of both the map library and
  the tile/data provider.
- Keep base map and deck.gl on the same projection (Web Mercator by default).
- When something renders in the wrong place, check `coordinateSystem` and
  that positions are `[longitude, latitude]`.
