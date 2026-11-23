# Using with Mapbox

| Import path             | deck.gl overlay                                                                          | Overlaid | Interleaved | React Map GL |
| ----------------------- | ---------------------------------------------------------------------------------------- | -------- | ----------- | ------------ |
| `@deck.gl/react/mapbox` | [`MapboxOverlay`](https://deck.gl/next/docs/api-reference/mapbox/mapbox-overlay.md) | ✓        | ✓           | ✓            |

[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) is a JavaScript library for building web maps. The `/mapbox` provider root creates a [`MapboxOverlay`](https://deck.gl/next/docs/api-reference/mapbox/mapbox-overlay.md) from [`@deck.gl/mapbox`](https://deck.gl/next/docs/api-reference/mapbox/overview.md) and renders its JSX layers into it. The application owns the Mapbox map and attaches the overlay to it. [Using with maps](https://deck.gl/next/docs/developer-guide/react/using-with-maps.md) describes the shared provider-root behavior and lifecycle.

deck.gl's [Using with Mapbox](https://deck.gl/next/docs/developer-guide/base-maps/using-with-mapbox.md) guide covers the same integration without `@deck.gl/react`.

## Integration modes[​](#integration-modes "Direct link to Integration modes")

* **Interleaved:** pass `interleaved` to render deck.gl layers into the Mapbox WebGL2 context. See deck.gl's [interleaved mode](https://deck.gl/next/docs/developer-guide/base-maps/using-with-mapbox.md#interleaved) description, including its compatibility and limitations.
* **Overlaid:** omit `interleaved`, or pass `false`, to render deck.gl into its own canvas inside the Mapbox controls container. See deck.gl's [overlaid mode](https://deck.gl/next/docs/developer-guide/base-maps/using-with-mapbox.md#overlaid) description.
* **Reverse controlled:** provider roots do not support this mode. See [Using with maps](https://deck.gl/next/docs/developer-guide/react/using-with-maps.md#reverse-controlled-maps).

For interleaved rendering, use `beforeId` to position deck layers relative to a Mapbox style layer. With Mapbox Standard, use the provider's `slot` support when it fits the style. Configure antialiasing and other map-owned WebGL settings on the Mapbox map.

## Install[​](#install "Direct link to Install")

Install the provider integration and the host SDK:

```
yarn add @deck.gl/mapbox mapbox-gl
```

## Examples[​](#examples "Direct link to Examples")

Keep the map in React state and pass it in `map`. `DeckGL` adds its overlay to the map, adds the new one when it recreates the overlay because `interleaved` changed, and removes it on unmount. It does not wait for the map to load: `MapboxOverlay` waits for the style before it adds layers.

### React Map GL[​](#react-map-gl "Direct link to React Map GL")

Give Mapbox options to React Map GL. Its callback ref stores the map in state.

```
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

### Manual map[​](#manual-map "Direct link to Manual map")

Create the map once, in an effect, and remove it in the effect's cleanup. Provider `DeckGL` renders no DOM node, so the container remains valid for Mapbox.

```
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

## Additional information[​](#additional-information "Direct link to Additional information")

### React Map GL `useControl`[​](#react-map-gl-usecontrol "Direct link to react-map-gl-usecontrol")

deck.gl's own guides attach the overlay with React Map GL's `useControl` hook. That does not work with these roots. `useControl` creates its control once, when it mounts, and keeps it. The root creates its own overlay, and creates a new one when `interleaved` changes, so `useControl` would hold the wrong instance. Pass the map in `map` instead.

### Mapbox token and alternatives[​](#mapbox-token-and-alternatives "Direct link to Mapbox token and alternatives")

Mapbox GL JS requires a Mapbox access token. deck.gl's guide explains how to [provide the token](https://deck.gl/next/docs/developer-guide/base-maps/using-with-mapbox.md#mapbox-token) and lists [alternatives to the Mapbox base map service](https://deck.gl/next/docs/developer-guide/base-maps/using-with-mapbox.md#alternatives-to-mapbox-basemap-sevice), including [MapLibre](https://deck.gl/next/docs/developer-guide/react/base-maps/using-with-maplibre.md).
