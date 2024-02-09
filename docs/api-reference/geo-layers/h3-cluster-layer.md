# H3ClusterLayer

import {H3ClusterLayerDemo} from '@site/src/doc-demos/geo-layers';

<H3ClusterLayerDemo />

The `H3ClusterLayer` renders regions represented by hexagon sets from the [H3](https://h3geo.org/) geospatial indexing system.

`H3ClusterLayer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {H3ClusterLayer} from '@deck.gl/geo-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     mean: 73.333,
   *     count: 440,
   *     hexIds: [
   *       '88283082b9fffff',
   *       '88283082b1fffff',
   *       '88283082b5fffff',
   *       '88283082b7fffff',
   *       '88283082bbfffff',
   *       '882830876dfffff'
   *     ]
   *   },
   *   ...
   * ]
   */
  const layer = new H3ClusterLayer({
    id: 'h3-cluster-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    getHexagons: d => d.hexIds,
    getFillColor: d => [255, (1 - d.mean / 500) * 255, 0],
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 2
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `density: ${object.mean}`} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {H3ClusterLayer} from '@deck.gl/geo-layers';
new H3ClusterLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/h3-js@^4.0.0"></script>
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.H3ClusterLayer({});
```

Note that `h3-js` must be included before `deck.gl`.

## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getHexagons` ([Function](../../developer-guide/using-layers.md#accessors), optional) {#gethexagons}

Method called to retrieve the hexagon cluster from each object, as an array of [H3](https://h3geo.org/) hexagon indices. These hexagons are joined into polygons that represent the geospatial outline of the cluster.


## Sub Layers

The `H3ClusterLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/column-layer.md) rendering all clusters.


## Source

[modules/geo-layers/src/h3-layers/h3-cluster-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-cluster-layer.ts)
