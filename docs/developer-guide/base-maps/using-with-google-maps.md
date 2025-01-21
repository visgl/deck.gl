# Using with Google Maps Platform

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
| ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/pure-js/google-maps) | [example](https://developers.google.com/maps/documentation/javascript/examples/deckgl-tripslayer) |

![deck.gl as a Google Maps overlay](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/google-maps.jpg)

## Integration Modes

When using deck.gl and Google Maps JavaScript API, there are three options you can choose from: interleaved, overlaid, and reverse-controlled.

### Interleaved

The [interleaved](../../get-started/using-with-map.md#interleaved) mode renders deck.gl layers into the WebGL2 context created by Google's vector map, using the Maps JavaScript API [WebGLOverlayView class](https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view). If you need to mix deck.gl layers with Maps layers, e.g. having deck.gl objects and Maps 3D buildings occluding each other correctly, then you have to use this option.

Interleaving is supported by using [GoogleMapsOverlay](../../api-reference/google-maps/google-maps-overlay.md) with an instance of Google's [vector map](https://developers.google.com/maps/documentation/javascript/vector-map). Some [limitations](../../api-reference/google-maps/overview.md#supported-features-and-limitations) apply when using this option.


### Overlaid

The [overlaid](../../get-started/using-with-map.md#overlaid) mode renders deck.gl in a separate canvas inside the Maps' controls container, using the Maps JavaScript API [OverlayView class](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView).

This is supported by using [GoogleMapsOverlay](../../api-reference/google-maps/google-maps-overlay.md) with Google's [raster map](https://developers.google.com/maps/documentation/javascript/vector-map). When a deck.gl overlay instance is added to the map, if a vector map is not detected or the user's device does not support WebGL2, it will automatically fallback to overlaid mode. You can also explicitly use this mode by setting the option `interleaved` to false when creating the GoogleMapsOverlay. In this mode, 3D features like tilt, rotation, and fractional zoom are not supported.

### Reverse Controlled

The reverse-controlled mode renders deck.gl above the Maps container and blocks any interaction to the base map. If your use case does not require interleaving, but you need to implement your own [pointer input handling](../../api-reference/core/controller.md), have multiple maps or a map that does not fill the whole canvas (with Deck's [multi-view feature](../views.md#using-multiple-views)), you need this to allow deck.gl manage the map's size and camera.

You cannot use Maps' own UI controls such as the zoom buttons or layer selector with this option. Instead, use the components from `@deck.gl/widgets`.


## Examples

### Example: interleaved or overlaid

Both the interleaved and the overlaid options are supported in by the [@deck.gl/google-maps](../../api-reference/google-maps/overview.md) module. This is recommended approach for developers coming from the Google Maps JavaScript API ecosystem, as it handles fallbacks gracefully, as well as being compatible with other Maps controls and plugins.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Loader} from '@googlemaps/js-api-loader';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {ScatterplotLayer} from '@deck.gl/layers';

const loader = new Loader({apiKey: '<google_maps_api_key>'});
const googlemaps = await loader.importLibrary('maps');

const map = new googlemaps.Map(document.getElementById('map'), {
  center: {lat: 51.47, lng: 0.45},
  zoom: 11,
  mapId: '<google_map_id>'
});

const overlay = new GoogleMapsOverlay({
  layers: [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        {position: [0.45, 51.47]}
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000
    })
  ]
});

overlay.setMap(map);
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useMemo, useEffect} from 'react';
import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';
import {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

function DeckGLOverlay(props: DeckProps) {
  const map = useMap();
  const overlay = useMemo(() => new GoogleMapsOverlay(props), []);

  useEffect(() => {
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map])

  overlay.setProps(props);
  return null;
}

function App() {
  const layers = [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        {position: [0.45, 51.47]}
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000
    })
  ];

  return <APIProvider apiKey="<google_maps_api_key>">
    <Map
      defaultCenter={{lat: 51.47, lng: 0.45}}
      defaultZoom={11}
      mapId="<google_maps_id>" >
      <DeckGLOverlay layers={layers} />
    </Map>
  </APIProvider>;
}
```

  </TabItem>
</Tabs>

You can find full project setups in the [react get-started example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/react/google-maps/) and [pure js get-started example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/pure-js/google-maps/).


### Example: reverse controlled

The reverse-controlled option is currently only supported in React when used with the `@visgl/react-google-maps` library.

```tsx
import React from 'react';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';

function App() {
  const layers = [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        {position: [0.45, 51.47]}
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000
    })
  ];

  return <APIProvider apiKey="<google_maps_api_key>">
    <DeckGL
      initialViewState={{
        longitude: 0.45,
        latitude: 51.47,
        zoom: 11
      }}
      controller
      layers={layers}
    >
      <Map mapId="<google_maps_id>" />
    </DeckGL>
  </APIProvider>;
}
```


## Additional Information

### react-google-maps

[@visgl/react-google-maps](https://visgl.github.io/react-google-maps/) is a React wrapper around Google Maps JavaScript API maintained by the vis.gl community. If you'd like to use deck.gl together with Google Maps and React, this library is the recommended companion.

When you choose the interleaved or overlaid option, the `@visgl/react-google-maps` [Map](https://visgl.github.io/react-google-maps/docs/api-reference/components/map) React component acts as the root component, and [GoogleMapsOverlay](../../api-reference/google-maps/google-maps-overlay.md) is used with a `useMemo` hook. 

When you choose the reverse-controlled option, the `DeckGL` React component acts as the root component, and the `@visgl/react-google-maps` [Map](https://visgl.github.io/react-google-maps/docs/api-reference/components/map) is a child. In this case, `Map` will automatically interpret the deck.gl view state (i.e. latitude, longitude, zoom etc), so that deck.gl layers will render as a synchronized geospatial overlay over the underlying map.


### Google Maps Platform API key

Note that to use deck.gl with the Google's basemap, you must load the Maps JavaScript API using a valid API key. For more information on getting an API key, see the [Google Maps Platform API key documentation](https://developers.google.com/maps/documentation/javascript/get-api-key) for the Maps JavaScript API.

If you are using `@visgl/react-google-maps`, supply the API key to the `APIProvider` and wrap it around all components that should have access to the Google Maps API. 
