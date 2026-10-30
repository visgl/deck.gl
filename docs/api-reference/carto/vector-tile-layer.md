# VectorTileLayer

`VectorTileLayer` is a layer for visualizing tiled vector data. It extends the [`MVTLayer`](https://deck.gl/docs/api-reference/geo-layers/mvt-layer.md) with CARTO-specific optimizations for efficient vector tile rendering, including binary data format support and separate geometry/attribute loading.

## Usage[​](#usage "Direct link to Usage")

```
import {DeckGL} from '@deck.gl/react';

import {VectorTileLayer} from '@deck.gl/carto';

import {vectorTableSource} from '@carto/api-client';



function App({viewState}) {

  const data = vectorTableSource({

    accessToken: 'XXX',

    connectionName: 'carto_dw',

    tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',

  });



  const layer = new VectorTileLayer({

    data,

    pointRadiusMinPixels: 2,

    getLineColor: [0, 0, 0, 200],

    getFillColor: [238, 77, 90],

    lineWidthMinPixels: 1

  })



  return <DeckGL viewState={viewState} layers={[layer]} />;

}
```

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```
import {VectorTileLayer} from '@deck.gl/carto';

new VectorTileLayer({});
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>



<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>
```

```
new deck.carto.VectorTileLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits all properties from [`MVTLayer`](https://deck.gl/docs/api-reference/geo-layers/mvt-layer.md).

#### `data` (TilejsonResult)[​](#data "Direct link to data")

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](https://deck.gl/docs/api-reference/carto/data-sources.md) to fetch this from the CARTO API:

* [vectorTableSource](https://deck.gl/docs/api-reference/carto/data-sources.md#vectortablesource)
* [vectorQuerySource](https://deck.gl/docs/api-reference/carto/data-sources.md#vectorquerysource)
* [vectorTilesetSource](https://deck.gl/docs/api-reference/carto/data-sources.md#vectortilesetsource)

#### `autoLabels` (boolean | object, optional)[​](#autolabels "Direct link to autolabels")

* Default: `false`

If `true`, automatically creates labels for lines and polygons at their centroids.

For more control over labeling, pass an object with the following properties:

* `uniqueIdProperty` (string): Property name to use for deduplication. Only creates a single label for each unique feature value.

## Source[​](#source "Direct link to Source")

[modules/carto/src/layers/vector-tile-layer.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/carto/src/layers/vector-tile-layer.ts)
