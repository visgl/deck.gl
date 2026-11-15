# H3ClusterLayer

import {H3ClusterLayerDemo} from '@site/src/doc-demos/geo-layers';

<H3ClusterLayerDemo />

The `H3ClusterLayer` renders regions represented by hexagon sets from the [H3](https://h3geo.org/) geospatial indexing system.

`H3ClusterLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="layer-input">
  <TabItem value="accessors" label="Classic accessors">

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {H3ClusterLayer} from '@deck.gl/geo-layers';

const layer = new H3ClusterLayer({
  id: 'H3ClusterLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3clusters.json',
  
  stroked: true,
  getHexagons: d => d.hexIds,
  getFillColor: d => [255, (1 - d.mean / 500) * 255, 0],
  getLineColor: [255, 255, 255],
  lineWidthMinPixels: 2,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `density: ${object.mean}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {} from '@deck.gl/geo-layers';

type DataType = {
  mean: number;
  count: number;
  hexIds: string[];
};

const layer = new H3ClusterLayer<DataType>({
  id: 'H3ClusterLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3clusters.json',
  
  stroked: true,
  getHexagons: (d: DataType) => d.hexIds,
  getFillColor: (d: DataType) => [255, (1 - d.mean / 500) * 255, 0],
  getLineColor: [255, 255, 255],
  lineWidthMinPixels: 2,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<DataType>) => object && `density: ${object.mean}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {H3ClusterLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  mean: number;
  count: number;
  hexIds: string[];
};

function App() {
  const layer = new H3ClusterLayer<DataType>({
    id: 'H3ClusterLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3clusters.json',
    
    stroked: true,
    getHexagons: (d: DataType) => d.hexIds,
    getFillColor: (d: DataType) => [255, (1 - d.mean / 500) * 255, 0],
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 2,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<DataType>) => object && `density: ${object.mean}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>

  </TabItem>
  <TabItem value="arrow" label="Arrow inputs">

```js
import {Field, List, Utf8, vectorFromArray} from 'apache-arrow';
import {H3ClusterLayer} from '@deck.gl/geo-layers';

const cells = vectorFromArray([['8928308280fffff']], new List(new Field('cell', new Utf8())));

const layer = new H3ClusterLayer({
  getHexagons: cells,
  getFillColor: [255, 140, 0]
});
```

See [Using with Arrow](../../developer-guide/using-with-arrow.md) for column layouts and mixed inputs.

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
import {H3ClusterLayer} from '@deck.gl/geo-layers';
import type {H3ClusterLayerProps} from '@deck.gl/geo-layers';

new H3ClusterLayer<DataT>(...props: H3ClusterLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/h3-js@^4.0.0"></script>
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.H3ClusterLayer({});
```

Note that `h3-js` must be included before `deck.gl`.

## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getHexagons` (Accessor | arrow.Vector, optional) {#gethexagons}

Method called to retrieve the hexagon cluster from each object, as an array of [H3](https://h3geo.org/) hexagon indices. These hexagons are joined into polygons that represent the geospatial outline of the cluster.

Each value supplies the identifiers for one cluster. See [cell identifier columns](../../developer-guide/using-with-arrow.md#cell-identifiers) for supported encodings and picking behavior.


#### `getFillColor` (constant | Accessor | arrow.Vector, optional) {#getfillcolor}

* Default: `[0, 0, 0, 255]`

The fill color of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell color columns](../../developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getLineColor` (constant | Accessor | arrow.Vector, optional) {#getlinecolor}

* Default: `[0, 0, 0, 255]`

The outline color of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell color columns](../../developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getLineWidth` (constant | Accessor | arrow.Vector, optional) {#getlinewidth}

* Default: `1`

The outline width of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell style columns](../../developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getElevation` (constant | Accessor | arrow.Vector, optional) {#getelevation}

* Default: `1000`

The elevation of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell style columns](../../developer-guide/using-with-arrow.md#cell-styling) for requirements.


## Sub Layers

The `H3ClusterLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/column-layer.md) rendering all clusters.


## Source

[modules/geo-layers/src/h3-layers/h3-cluster-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-cluster-layer.ts)
