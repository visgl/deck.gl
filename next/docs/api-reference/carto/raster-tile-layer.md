# RasterTileLayer

`RasterTileLayer` is a layer for visualizing tiled raster data.

## Usage[​](#usage "Direct link to Usage")

```
import {DeckGL} from '@deck.gl/react';

import {RasterTileLayer} from '@deck.gl/carto';

import {rasterSource} from '@carto/api-client';



function App({viewState}) {

  const data = rasterSource({

    accessToken: 'XXX',

    connectionName: 'carto_dw',

    tableName: 'cartobq.public_account.temperature_raster'

  });



  const layer = new RasterTileLayer({

    data,

    getFillColor: d => {

      const {band_1} = d.properties;

      return [10 * (band_1 - 20), 0, 300 - 5 * band_1];

    }

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
import {RasterTileLayer} from '@deck.gl/carto';

new RasterTileLayer({});
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
new deck.carto.RasterTileLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits all properties from [`ColumnLayer`](https://deck.gl/next/docs/api-reference/layers/column-layer.md) and [`TileLayer`](https://deck.gl/next/docs/api-reference/geo-layers/tile-layer.md), with exceptions indicated below.

#### `data` (TilejsonResult)[​](#data "Direct link to data")

Required. A valid `TilejsonResult` object.

Use the [rasterSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#rastersource) to fetch this from the CARTO API.

## Source[​](#source "Direct link to Source")

[modules/carto/src/layers/raster-tile-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/raster-tile-layer.ts)
