# Using with Google Maps

| Import path | deck.gl overlay | Overlaid | Interleaved | React Google Maps |
| --- | --- | --- | --- | --- |
| `@deck.gl/react/google-maps` | [`GoogleMapsOverlay`](../../../api-reference/google-maps/google-maps-overlay.md) | ✓ | ✓ (vector maps) | ✓ |

The [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
renders Google's base maps in the browser. The `/google-maps` provider root creates a
[`GoogleMapsOverlay`](../../../api-reference/google-maps/google-maps-overlay.md) from
[`@deck.gl/google-maps`](../../../api-reference/google-maps/overview.md) and renders its
JSX layers into it. The application owns the Google map and attaches the overlay to it.
[Using with maps](../using-with-maps.md) describes the shared provider-root behavior and lifecycle.

deck.gl's [Using with Google Maps](../../base-maps/using-with-google-maps.md)
guide covers the same integration without `@deck.gl/react`.

## Integration modes

- **Interleaved:** the default. `GoogleMapsOverlay` defaults `interleaved` to `true`, unlike
  `MapboxOverlay` and `MapLibreOverlay`, and the root passes the prop through unchanged. deck.gl
  renders into the map's WebGL context, so deck.gl layers and the map's 3D buildings can occlude each other.
  This needs a [vector map](https://developers.google.com/maps/documentation/javascript/vector-map),
  which needs a map ID.
- **Overlaid:** pass `interleaved={false}` to render deck.gl into its own canvas above the map.
  A raster map always renders this way, whatever `interleaved` is.
- **Reverse controlled:** provider roots do not support this mode. See
  [Using with maps](../using-with-maps.md#reverse-controlled-maps).

`GoogleMapsOverlay` waits for the map to report its rendering type before it creates its deck.gl
instance, and creates a new one if the map changes between vector and raster, for example when the
browser cannot run a vector map. The application does not need to handle either case.

`GoogleMapsOverlay` reads `interleaved` when it attaches to the map. When the prop changes, `DeckGL`
detaches and finalizes the current overlay, creates a new one, and attaches it to the same map.

## Views

`GoogleMapsOverlay` draws one deck.gl `MapView`, which follows the Google map's camera. It does not
support views beside the map: the root does not send JSX views, such as `<MapView>` or
`<deckView>`, to the overlay. Do not pass `views`.

The Google Maps overlay excludes `width`, `height`, `gl` and `deviceProps` in addition to the
map-owned props listed in [Provider prop boundary](../using-with-maps.md#provider-prop-boundary).

## Install

Install the provider integration, and a way to load the Maps JavaScript API, such as
[`@vis.gl/react-google-maps`](https://visgl.github.io/react-google-maps/):

```bash
yarn add @deck.gl/google-maps @vis.gl/react-google-maps
```

`@deck.gl/google-maps` installs the `@types/google.maps` typings. The Maps JavaScript API needs an
[API key](https://developers.google.com/maps/documentation/javascript/get-api-key); keep it out of
source control, for example in an environment variable that your bundler exposes to the browser.

## Examples

Keep the map in React state, or read it from a hook that re-renders when it is ready, and pass it in
`map`. `DeckGL` attaches its overlay with `overlay.setMap(map)`, attaches the new one when it
recreates the overlay because `interleaved` changed, and detaches it with `setMap(null)` on unmount.

### React Google Maps

The `@vis.gl/react-google-maps` `<Map>` component owns all Google map options. It does not expose
the map through a ref; read it with `useMap()` in a component rendered inside `<Map>`. `useMap()`
returns `null` until the map exists, and `DeckGL` attaches the overlay once it does.

```tsx
import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';
import {DeckGL} from '@deck.gl/react/google-maps';

function DeckOverlay() {
  const map = useMap();

  return (
    <DeckGL map={map}>
      {/* Layer components, such as <ScatterplotLayer /> */}
    </DeckGL>
  );
}

export function GoogleMap({apiKey, mapId}: {apiKey: string; mapId: string}) {
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        defaultCenter={{lat: 37.8, lng: -122.4}}
        defaultZoom={12}
        style={{height: 500}}
      >
        <DeckOverlay />
      </Map>
    </APIProvider>
  );
}
```

### Manual map

Load the Maps JavaScript API with Google's
[bootstrap loader](https://developers.google.com/maps/documentation/javascript/load-maps-js-api),
create the map once in an effect, and set it in state.

```tsx
import {useEffect, useRef, useState} from 'react';
import {DeckGL} from '@deck.gl/react/google-maps';

export function ManualGoogleMap({mapId}: {mapId: string}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    let cancelled = false;
    google.maps.importLibrary('maps').then(library => {
      if (cancelled || !containerRef.current) return;
      const {Map} = library as google.maps.MapsLibrary;
      setMap(new Map(containerRef.current, {center: {lat: 37.8, lng: -122.4}, mapId, zoom: 12}));
    });

    return () => {
      cancelled = true;
      setMap(null);
    };
  }, [mapId]);

  return (
    <>
      <div ref={containerRef} style={{height: 500}} />
      <DeckGL map={map}>{/* Layer components, such as <ScatterplotLayer /> */}</DeckGL>
    </>
  );
}
```

## Additional information

### Attaching without `map`

Without `map`, keep the instance from `onDeckChange` in state, call `overlay.setMap(map)` in an
effect that depends on the instance, and call `overlay.setMap(null)` in the effect's cleanup.
