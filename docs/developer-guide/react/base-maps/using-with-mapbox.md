# Using with Mapbox

| Import path | deck.gl overlay | Overlaid | Interleaved | React Map GL |
| --- | --- | --- | --- | --- |
| `@deck.gl/react/mapbox` | [`MapboxOverlay`](../../../api-reference/mapbox/mapbox-overlay.md) | ✓ | ✓ | ✓ |

[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) is a JavaScript library for building web
maps. The `/mapbox` provider root creates a
[`MapboxOverlay`](../../../api-reference/mapbox/mapbox-overlay.md) from
[`@deck.gl/mapbox`](../../../api-reference/mapbox/overview.md) and renders its JSX
layers into it. The application owns the Mapbox map and attaches the overlay to it.
[Using with maps](../using-with-maps.md) describes the shared provider-root behavior and lifecycle.

deck.gl's [Using with Mapbox](../../base-maps/using-with-mapbox.md)
guide covers the same integration without `@deck.gl/react`.

## Integration modes

- **Interleaved:** pass `interleaved` to render deck.gl layers into the Mapbox WebGL2 context. See
  deck.gl's
  [interleaved mode](../../base-maps/using-with-mapbox.md#interleaved)
  description, including its compatibility and limitations.
- **Overlaid:** omit `interleaved`, or pass `false`, to render deck.gl into its own canvas inside
  the Mapbox controls container. See deck.gl's
  [overlaid mode](../../base-maps/using-with-mapbox.md#overlaid)
  description.
- **Reverse controlled:** provider roots do not support this mode. See
  [Using with maps](../using-with-maps.md#reverse-controlled-maps).

For interleaved rendering, use `beforeId` to position deck layers relative to a Mapbox style
layer. With Mapbox Standard, use the provider's `slot` support when it fits the style. Configure
antialiasing and other map-owned WebGL settings on the Mapbox map.

## Install

Install the provider integration and the host SDK:

```bash
yarn add @deck.gl/mapbox mapbox-gl
```

## Examples

Keep the map in React state and pass it in [`map`](../../../api-reference/react/deckgl.md#map).
[Attach the overlay to the host map](../using-with-maps.md#attach-the-overlay-to-the-host-map) says when `DeckGL` adds and removes the overlay.

### React Map GL

Give Mapbox options to React Map GL. Its callback ref stores the map in state.

```tsx
import {useState} from 'react';
import Map, {type MapRef} from 'react-map-gl/mapbox';
import {DeckGL} from '@deck.gl/react/mapbox';

export function MapboxMap() {
  const [map, setMap] = useState<MapRef | null>(null);

  return (
    <Map
      ref={setMap}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      mapStyle="mapbox://styles/mapbox/standard"
      initialViewState={{longitude: -122.4, latitude: 37.8, zoom: 12}}
    >
      <DeckGL map={map} interleaved>
        {/* Layer components, such as <ScatterplotLayer /> */}
      </DeckGL>
    </Map>
  );
}
```

### Manual map

Create the map once, in an effect, and remove it in the effect's cleanup. Provider `DeckGL`
renders no DOM node, so the container remains valid for Mapbox.

```tsx
import {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import {DeckGL} from '@deck.gl/react/mapbox';

export function ManualMapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      container: containerRef.current,
      center: [-122.4, 37.8],
      style: 'mapbox://styles/mapbox/standard',
      zoom: 12
    });
    setMap(instance);

    return () => {
      setMap(null);
      instance.remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{height: 500}}>
      <DeckGL map={map} interleaved>
        {/* Layer components, such as <ScatterplotLayer /> */}
      </DeckGL>
    </div>
  );
}
```

## Additional information

### React Map GL `useControl`

deck.gl's own guides attach the overlay with React Map GL's `useControl` hook, which doesn't work
with `DeckGL`. Pass the map in `map` instead. [Attach the overlay to the host map](../using-with-maps.md#attach-the-overlay-to-the-host-map) explains why.

### Mapbox token and alternatives

Mapbox GL JS requires a Mapbox access token. deck.gl's guide explains how to
[provide the token](../../base-maps/using-with-mapbox.md#mapbox-token)
and lists
[alternatives to the Mapbox base map service](../../base-maps/using-with-mapbox.md#alternatives-to-mapbox-basemap-sevice),
including [MapLibre](using-with-maplibre.md).
