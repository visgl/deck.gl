# MapboxOverlay

`MapboxOverlay` is an implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. When adding a `MapboxOverlay` control to an mapbox map, deck.gl layers are rendered in synchronization with the base map layers. This control supports both [overlaid and interleaved](../../get-started/using-with-map.md) rendering modes.

## Example

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

See react-map-gl's [useControl](https://visgl.github.io/react-map-gl/docs/api-reference/use-control) hook.

  </TabItem>
</Tabs>


## Constructor

```ts
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';

new MapboxOverlay(props: MapboxOverlayProps);
```

`MapboxOverlay` accepts the same props as the [Deck](../core/deck.md) class, with the following exceptions:

- `views` - multi-view support is limited. There is only one `MapView` that can synchronize with the base map. See the [using with multi-views](#multi-view-usage) section for details.
- `parent` / `canvas` / `device` - context creation is managed internally.
- `viewState` / `initialViewState` - camera state is managed internally.
- `controller` - always disabled (to use Mapbox's interaction handlers).

The constructor additionally accepts the following option:

- `interleaved` (boolean) - If `false`, a dedicated deck.gl canvas is added on top of the base map. If `true`, deck.gl layers are inserted into mapbox-gl's layer stack, and share the same `WebGL2RenderingContext` as the base map. Default is `false`. Note that interleaving with basemaps such as mapbox-gl-js v1 that only support WebGL 1 is not supported, see [compatibility](./overview#compatibility).

When using `interleaved: true`, you may optionally add a `beforeId` prop to a layer to specify its position in the Mapbox layer stack. If multiple deck.gl layers have the same `beforeId`, they are rendered in the order that is passed into the `layers` array.

## Methods

##### setProps

```ts
const overlay = new MapboxOverlay({
  interleaved: true,
  layers: []
});

map.addControl(overlay);

// Update layers
overlay.setProps({
  layers: [new ScatterplotLayer({...})]
})
```

Updates (partial) props of the underlying `Deck` instance. See [Deck.setProps](../core/deck.md#setprops).

##### pickObject

See [Deck.pickObject](../core/deck.md#pickobject).

##### pickObjects

See [Deck.pickObjects](../core/deck.md#pickobjects).

##### pickMultipleObjects

See [Deck.pickMultipleObjects](../core/deck.md#pickmultipleobjects).

##### finalize

Removes the control and deletes all resources.

##### getCanvas

See [Deck.getCanvas](../core/deck.md#getcanvas). When using `interleaved: true`, returns the base map's `canvas`.

## Remarks

### Multi-view usage

When using `MapboxOverlay` with multiple views passed to the `views` prop, only one of the views can match the base map and receive interaction.

With that said, it is still possible to take advantage of deck's multi-view system and render a mapbox base map onto any one MapView of your choice by setting the `views` array and a `layerFilter` callback.

- To use multiple views, define a `MapView` with the id `“mapbox”`. This view will receive the state that matches the base map at each render.
- If views are provided but the array does not contain this id, then a `MapView({id: 'mapbox'})` will be inserted at the bottom of the stack.

```ts
import {MapboxOverlay} from '@deck.gl/mapbox';
import {Deck, MapView, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const overlay = new MapboxOverlay({
  views: [
    // This view will be synchronized with the base map
    new MapView({id: 'mapbox'}),
    // This view will not be interactive
    new OrthographicView({id: 'widget'})
  ],
  layerFilter: ({layer, viewport}) => {
    const shouldDrawInWidget = layer.id.startsWith('widget');
    if (viewport.id === 'widget') return shouldDrawInWidget;
    return !shouldDrawInWidget;
  },
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [
        {position: [-74.5, 40], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 0, 0]
    }),
    new ScatterplotLayer({
      id: 'widget-scatterplot',
      data: [
        {position: [0, 0], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 0, 0]
    })
  ]
});

map.addControl(overlay);
```
