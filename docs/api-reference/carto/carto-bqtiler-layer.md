

# CartoBQTilerLayer

`CartoBQTilerLayer` is the legacy layer to visualize large datasets (millions or billions of rows) directly from [Google BigQuery](https://cloud.google.com/bigquery) without having to move data outside of BigQuery.

First you need first to generate a tileset of your dataset in your BigQuery account using CARTO BigQuery Tiler. For more info click [here](https://carto.com/bigquery-tiler/).

Note:

- Our recommendation is to migrate the existing code to the new `CartoLayer` because this layer will be removed in a future version. 
 
With the legacy layer, your code to visualize a public tileset looks like this (no need to set the default credentials):

```js
import DeckGL from '@deck.gl/react';
import {CartoBQTilerLayer} from '@deck.gl/carto';

function App({viewState}) {
  const layer = new CartoBQTilerLayer({
    data: 'cartobq.maps.nyc_taxi_points_demo_id',
    getLineColor: [255, 255, 255],
    getFillColor: [238, 77, 90],
    pointRadiusMinPixels: 2,
    lineWidthMinPixels: 1
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

To migrate the code to use the new `CartoLayer`, you need to make the following changes:

- Use the `setConfig` function instead of the `setCredentials` function. You need to provide a username/api key combination both for public and private tilesets. For private tilesets, the API key needs to have access to the Maps API and the user must have configured a BigQuery connection in the CARTO dashboard.
- Instantiate a `CartoLayer` instead of a `CartoBQTilerLayer`. Comparing to the `CartoSQLLayer` instantiation, you need to provide one additional property: `type` with the value `MAP_TYPES.TILESET`

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setConfig, MAP_TYPES} from '@deck.gl/carto';

setConfig({
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoBQTilerLayer({
    type: MAP_TYPES.TILESET,
    data: 'cartobq.maps.nyc_taxi_points_demo_id',
    getLineColor: [255, 255, 255],
    getFillColor: [238, 77, 90],
    pointRadiusMinPixels: 2,
    lineWidthMinPixels: 1
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {CartoBQTilerLayer} from '@deck.gl/carto';
new CartoBQTilerLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.2.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.2.0/dist.min.js"></script>
```

```js
new deck.carto.CartoBQTilerLayer({});
```


## Properties

Inherits all properties from [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md).


##### `data` (String)

Required. Tileset id

##### `uniqueIdProperty` (String)

* Default: `id`

Optional. Needed for highlighting a feature split across two or more tiles if no [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) is provided.

A string pointing to a tile attribute containing a unique identifier for features across tiles.

##### `config` (Object)

Optional. Object with the configuration to connect with CARTO.

* Default:

```js
{
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  mapsUrl: 'https://maps-api-v2.{region}.carto.com/user/{user}',
}
```

### Callbacks

#### `onDataLoad` (Function, optional)

`onDataLoad` is called when the request to the CARTO tiler was completed successfully.

- Default: `tilejson => {}`

Receives arguments:

- `tilejson` (Object) - the response from the tiler service

##### `onDataError` (Function, optional)

`onDataError` is called when the request to the CARTO tiler failed. By default the Error is thrown.

- Default: `null`

Receives arguments:

- `error` (`Error`)


## Source

[modules/carto/src/layers/carto-bqtiler-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-bqtiler-layer.js)
