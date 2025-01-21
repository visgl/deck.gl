# Using with Mapbox

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-overlay) |

![deck.gl interleaved with Mapbox layers](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)

[Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) is a popular JavaScript library from [Mapbox](https://mapbox.com) for building web map applications. deck.gl's `MapView` can sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

## Integration Modes

When using deck.gl and Mapbox, there are three options you can choose from: interleaved, overlaid, and reverse-controlled.

### Interleaved

The [interleaved](../../get-started/using-with-map.md#interleaved) mode renders deck.gl layers into the WebGL2 context created by Mapbox. If you need to mix deck.gl layers with Mapbox layers, e.g. having deck.gl surfaces below text labels, or objects occluding each other correctly in 3D, then you have to use this option.

Interleaving is supported by using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay.md) with `interleaved: true`. It requires WebGL2 and therefore only works with `mapbox-gl@>2.13`. See [compatibility](../../api-reference/mapbox/overview#interleaved-renderer-compatibility) and [limitations](../../api-reference/mapbox/overview.md#limitations).


### Overlaid

The [overlaid](../../get-started/using-with-map.md#overlaid) mode renders deck.gl in a separate canvas inside the Mapbox's controls container. If your use case does not require interleaving, but you still want to use certain features of mapbox-gl, such as mapbox-gl controls (e.g. `NavigationControl`, `Popup`) or plugins (e.g. [navigation directions](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/), [mapbox-gl-draw](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/)), then you should use this option.

This is supported by using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay.md) with `interleaved: false`.


### Reverse Controlled

The reverse-controlled mode renders deck.gl above the Mapbox container and blocks any interaction to the base map. If your use case does not require interleaving, but you need to implement your own [pointer input handling](../../api-reference/core/controller.md), have multiple maps or a map that does not fill the whole canvas (with Deck's [multi-view feature](../views.md#using-multiple-views)), you need this to allow deck.gl manage the map's size and camera.

You cannot use mapbox-gl controls and plugins with this option. Instead, use the components from `@deck.gl/widgets`.


## Examples

### Example: interleaved or overlaid

Both the interleaved and the overlaid options are supported in by the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module. This is recommended approach for developers coming from the Mapbox ecosystem, as it can easily switch between interleaved and overlaid rendering, as well as being compatible with other Mapbox controls and plugins.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  accessToken: '<mapbox_access_token>',
  center: [0.45, 51.47],
  zoom: 11
});

map.once('load', () => {
  const deckOverlay = new MapboxOverlay({
    interleaved: true,
    layers: [
      new ScatterplotLayer({
        id: 'deckgl-circle',
        data: [
          {position: [0.45, 51.47]}
        ],
        getPosition: d => d.position,
        getFillColor: [255, 0, 0, 100],
        getRadius: 1000,
        beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
      })
    ]
  });

  map.addControl(deckOverlay);
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {Map, useControl} from 'react-map-gl';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const layers: [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        {position: [0.45, 51.47]}
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000,
      beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
    })
  ];

  return (
    <Map
      initialViewState={{
        longitude: 0.45,
        latitude: 51.47,
        zoom: 11
      }}
      mapStyle="mapbox://styles/mapbox/light-v9"
      mapboxAccessToken="<mapbox_access_token>"
    >
      <DeckGLOverlay layers={layers} interleaved />
    </Map>
  );
}
```

  </TabItem>
</Tabs>


You can find full project setups in the [react get-started example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/react/mapbox/) and [pure js get-started example](https://github.com/visgl/deck.gl/tree/9.1-release/examples/get-started/pure-js/mapbox/).


### Example: reverse controlled

The reverse-controlled option is supported by the pre-built scripting bundle, and in React when used with the `react-map-gl` library. There is currently no easy way to do it under Vanilla JS.

<Tabs groupId="language">
  <TabItem value="scripting" label="Scripting">

```js
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet" />
<script type="text/javascript">
  const {DeckGL, ScatterplotLayer} = deck;

  mapboxgl.accessToken = '<mapbox_access_token>';

  new DeckGL({
    mapStyle: 'mapbox://styles/mapbox/light-v9',
    initialViewState: {
      longitude: 0.45,
      latitude: 51.47,
      zoom: 11
    },
    controller: true,
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
</script>
```

  </TabItem>

  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {Map} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const layers: [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        {position: [0.45, 51.47]}
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000,
    })
  ];

  return (
    <DeckGL
      initialViewState={{
        longitude: 0.45,
        latitude: 51.47,
        zoom: 11
      }}
      controller
      layers={layers}
    >
      <Map
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken="<mapbox_access_token>"
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>


## Additional Information

### react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl maintained by the vis.gl community. If you'd like to use deck.gl together with mapbox-gl and React, this library is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/9.1-release/examples/website) are implemented using the React integration.

When you choose the interleaved or overlaid option, the react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) React component acts as the root component, and [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#example) is used with react-map-gl's `useControl` hook. 

When you choose the reverse-controlled option, the `DeckGL` React component acts as the root component, and the react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) is a child. In this case, `Map` will automatically interpret the deck.gl view state (i.e. latitude, longitude, zoom etc), so that deck.gl layers will render as a synchronized geospatial overlay over the underlying map.


### Mapbox Token

To use Mapbox, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain level](https://www.mapbox.com/pricing/) of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToken` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the react-map-gl `Map` component `<Map mapboxAccessToken={TOKEN} />`

### Alternatives to Mapbox basemap sevice

As of v2.0, Mapbox GL JS [went proprietary](https://github.com/mapbox/mapbox-gl-js/blob/main/CHANGELOG.md#200) and requires a Mapbox account to use even if you don't load tiles from the Mapbox server. If you do not wish to use the Mapbox service, you may also consider:

- mapbox-gl v1.13, the last release before the license change. Interleaving is not supported by this version.
- [MapLibre GL JS](https://maplibre.org), a community-supported WebGL map library. maplibre-gl can generally be used as a drop-in replacement of mapbox-gl, with some of its own features and APIs. More information can be found in [using with MapLibre](./using-with-maplibre.md).
