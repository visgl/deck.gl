# Using with MapLibre

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maplibre) | [example](https://deck.gl/gallery/maplibre-overlay) |

[MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) is a powerful open-source library that uses WebGL to render interactive maps from vector tiles in a browser. deck.gl's `MapView` can sync perfectly with the camera of MapLibre, at every zoom level and rotation angle.

## Integration Modes

When using deck.gl and MapLibre, there are three options you can choose from: interleaved, overlaid, and reverse-controlled.

### Interleaved

The [interleaved](../../get-started/using-with-map.md#interleaved) mode renders deck.gl layers into the WebGL2 context created by MapLibre. If you need to mix deck.gl layers with MapLibre layers, e.g. having deck.gl surfaces below text labels, or objects occluding each other correctly in 3D, then you have to use this option.

Interleaving is supported by using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay.md) with `interleaved: true`. It requires WebGL2 and therefore only works with `maplibre-gl@>3`. See [compatibility](../../api-reference/mapbox/overview#interleaved-renderer-compatibility) and [limitations](../../api-reference/mapbox/overview.md#limitations).


### Overlaid

The [overlaid](../../get-started/using-with-map.md#overlaid) mode renders deck.gl in a separate canvas inside the MapLibre's controls container. If your use case does not require interleaving, but you still want to use certain features of maplibre-gl, such as maplibre-gl controls (e.g. `NavigationControl`, `Popup`) or plugins (e.g. [navigation directions](https://github.com/mapbox/mapbox-gl-directions), [mapbox-gl-draw](https://maplibre.org/maplibre-gl-js/docs/examples/mapbox-gl-draw/)), then you should use this option.

This is supported by using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay.md) with `interleaved: false`.


### Reverse Controlled

The reverse-controlled mode renders deck.gl above the MapLibre container and blocks any interaction to the base map. If your use case does not require interleaving, but you need to implement your own [pointer input handling](../../api-reference/core/controller.md), have multiple maps or a map that does not fill the whole canvas (with Deck's [multi-view feature](../views.md#using-multiple-views)), you need this to allow deck.gl manage the map's size and camera.

You cannot use maplibre-gl controls and plugins with this option. Instead, use the components from `@deck.gl/widgets`.


## Examples

### Example: interleaved or overlaid

Both the interleaved and the overlaid options are supported by the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module. This is recommended approach for developers coming from the MapLibre ecosystem, as it can easily switch between interleaved and overlaid rendering, as well as being compatible with other MapLibre controls and plugins.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';
import {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0.45, 51.47],
  zoom: 11
});

await map.once('load');

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
      beforeId: 'watername_ocean' // In interleaved mode render the layer under map labels
    })
  ]
});

map.addControl(deckOverlay);
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
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
      getRadius: 1000,
      beforeId: 'watername_ocean' // In interleaved mode render the layer under map labels
    })
  ];

  return (
    <Map
      initialViewState={{
        longitude: 0.45,
        latitude: 51.47,
        zoom: 11
      }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <DeckGLOverlay layers={layers} interleaved />
    </Map>
  );
}
```

  </TabItem>
</Tabs>


You can find full project setups in the [react get-started example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/maplibre/) and [pure js get-started example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maplibre/).


### Example: reverse controlled

The reverse-controlled option is supported by the pre-built scripting bundle, and in React when used with the `react-map-gl` library. There is currently no easy way to do it under Vanilla JS.

<Tabs groupId="language">
  <TabItem value="scripting" label="Scripting">

```js
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/maplibre-gl@^4.0.0/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@^4.0.0/dist/maplibre-gl.css" rel="stylesheet" />
<script type="text/javascript">
  const {DeckGL, ScatterplotLayer} = deck;

  new DeckGL({
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
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
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const layers = [
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
      <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>


## Additional Information

### react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around maplibre-gl maintained by the vis.gl community. If you'd like to use deck.gl together with maplibre-gl and React, this library is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/master/examples/website) are implemented using the React integration.

When you choose the interleaved or overlaid option, the react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) React component acts as the root component, and [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#example) is used with react-map-gl's `useControl` hook. 

When you choose the reverse-controlled option, the `DeckGL` React component acts as the root component, and the react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) is a child. In this case, `Map` will automatically interpret the deck.gl view state (i.e. latitude, longitude, zoom etc), so that deck.gl layers will render as a synchronized geospatial overlay over the underlying map.


### Choosing a map tile service

There are paid map tile servers such as [MapTiler](https://www.maptiler.com/), [Stadia Maps](https://stadiamaps.com/), and [AWS Location Service](https://docs.aws.amazon.com/location/latest/developerguide/map-concepts.html).

deck.gl public demos use [CARTO free basemaps](https://carto.com/basemaps) as a non-commercial application. Checkout [this guide](../../api-reference/carto/basemap.md) to start using it.

If you host your own map tiles, you will need a custom map style JSON that points to your own [vector tile source](https://maplibre.org/maplibre-style-spec/), this custom style must match the schema of your tile source.

Open source tile schemas include:

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)
- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)

Some useful resources for hosting your own map tiles:

- [Martin](https://github.com/maplibre/martin), a tile server from the MapLibre organization
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)
- [Maputnik Style editor](https://maplibre.org/maputnik/)
