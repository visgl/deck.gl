# GreatCircleLayer

<!-- -->

Edit on Codepen

The `GreatCircleLayer` is a variation of the [ArcLayer](https://deck.gl/next/docs/api-reference/layers/arc-layer.md). It renders flat arcs along the great circle joining pairs of source and target points, specified as latitude/longitude coordinates.

> Starting v8.2, using this layer is identical to using the `ArcLayer` with props `greatCircle: true` and `getHeight: 0`.

<!-- -->

* JavaScript
* TypeScript
* React

```
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

```
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

```
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

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```
import {GreatCircleLayer} from '@deck.gl/geo-layers';

import type {GreatCircleLayerProps} from '@deck.gl/geo-layers';



new GreatCircleLayer<DataT>(...props: GreatCircleLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.GreatCircleLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) and [ArcLayer](https://deck.gl/next/docs/api-reference/layers/arc-layer.md) properties.

## Remarks[​](#remarks "Direct link to Remarks")

### Using with GlobeView[​](#using-with-globeview "Direct link to Using with GlobeView")

When using this layer with [GlobeView](https://deck.gl/next/docs/api-reference/core/globe-view.md) or MapLibre's globe projection, arcs may be invisible when viewed from certain angles because `GlobeView` enables back-face culling by default. To ensure arcs are visible from both sides, set:

```
new GreatCircleLayer({

  // ...other props

  parameters: {cullMode: 'none'}

});
```

## Source[​](#source "Direct link to Source")

[great-circle-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/great-circle-layer)
