# QuadbinTileLayer

`QuadbinTileLayer` is a layer for visualizing tiled data described using the [Quadbin Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin).

## Usage[​](#usage "Direct link to Usage")

```
import {DeckGL} from '@deck.gl/react';

import {QuadbinTileLayer} from '@deck.gl/carto';

import {quadbinTilesetSource} from '@carto/api-client';



function App({viewState}) {

  const data = quadbinTilesetSource({

    accessToken: 'XXX',

    connectionName: 'carto_dw',

    tableName: 'carto-demo-data.demo_tilesets.quadbin'

  });



  const layer = new QuadbinTileLayer({

    data,

    getFillColor: d => d.properties.color

  })



  return <DeckGL viewState={viewState} layers={[layer]} />;

}
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```
import {QuadbinTileLayer} from '@deck.gl/carto';

new QuadbinTileLayer({});
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
new deck.carto.QuadbinTileLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits all properties from [`QuadkeyLayer`](https://deck.gl/next/docs/api-reference/geo-layers/quadkey-layer.md) and [`TileLayer`](https://deck.gl/next/docs/api-reference/geo-layers/tile-layer.md), with exceptions and additions noted below.

#### `data` (TilejsonResult)[​](#data "Direct link to data")

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](https://deck.gl/next/docs/api-reference/carto/data-sources.md) to fetch this from the CARTO API:

* [quadbinTableSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbintablesource)
* [quadbinQuerySource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbinquerysource)
* [quadbinTilesetSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbintilesetsource)

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getQuadbin` ([Accessor\<BigInt>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getquadbin "Direct link to getquadbin")

*Note that the [`getQuadkey` accessor](https://deck.gl/next/docs/api-reference/geo-layers/quadkey-layer.md#getquadkey) is replaced with `getQuadbin`*.

Called for each data object to retrieve the quadbin bigint identifier.

* default: `object => object.quadbin`

## Source[​](#source "Direct link to Source")

[modules/carto/src/layers/quadbin-tile-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/quadbin-tile-layer.ts)
