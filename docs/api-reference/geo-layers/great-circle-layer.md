# GreatCircleLayer

import {GreatCircleLayerDemo} from '@site/src/doc-demos/geo-layers';

<GreatCircleLayerDemo />

The `GreatCircleLayer` is a variation of the [ArcLayer](../layers/arc-layer.md). It renders flat arcs along the great circle joining pairs of source and target points,
specified as latitude/longitude coordinates.

> Starting v8.2, using this layer is identical to using the `ArcLayer` with props `greatCircle: true` and `getHeight: 0`.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {GreatCircleLayer} from '@deck.gl/geo-layers';

const layer = new GreatCircleLayer({
  id: 'GreatCircleLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/flights.json',
  
  getSourcePosition: d => d.from.coordinates,
  getTargetPosition: d => d.to.coordinates,
  getSourceColor: [64, 255, 0],
  getTargetColor: [0, 128, 200],
  getWidth: 5,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `${object.from.name} to ${object.to.name}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {GreatCircleLayer} from '@deck.gl/geo-layers';

type Flight = {
  from: {
    name: string;
    coordinates: [longitude: number, latitude: number];
  };
  to: {
    name: string;
    coordinates: [longitude: number, latitude: number];
  };
};

const layer = new GreatCircleLayer<Flight>({
  id: 'GreatCircleLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/flights.json',
  
  getSourcePosition: (d: Flight) => d.from.coordinates,
  getTargetPosition: (d: Flight) => d.to.coordinates,
  getSourceColor: [64, 255, 0],
  getTargetColor: [0, 128, 200],
  getWidth: 5,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<Flight>) => object && `${object.from.name} to ${object.to.name}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {GreatCircleLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type Flight = {
  from: {
    name: string;
    coordinates: [longitude: number, latitude: number];
  };
  to: {
    name: string;
    coordinates: [longitude: number, latitude: number];
  };
};

function App() {
  const layer = new GreatCircleLayer<Flight>({
    id: 'GreatCircleLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/flights.json',
    
    getSourcePosition: (d: Flight) => d.from.coordinates,
    getTargetPosition: (d: Flight) => d.to.coordinates,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    getWidth: 5,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<Flight>) => object && `${object.from.name} to ${object.to.name}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```ts
import {GreatCircleLayer} from '@deck.gl/geo-layers';
import type {GreatCircleLayerProps} from '@deck.gl/geo-layers';

new GreatCircleLayer<DataT>(...props: GreatCircleLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.GreatCircleLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [ArcLayer](../layers/arc-layer.md) properties.

## Source

[great-circle-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/geo-layers/src/great-circle-layer)
