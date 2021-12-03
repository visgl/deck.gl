# CartoLayer

`CartoLayer` is the layer to visualize data using the CARTO Maps API.

## Usage CARTO 3

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS} from '@deck.gl/carto';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accessToken: 'XXX',
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.QUERY,
    connection: 'bigquery',
    data: 'SELECT * FROM cartobq.testtables.points_10k',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 200],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Usage CARTO 2

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS} from '@deck.gl/carto';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.QUERY,
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 125],
    getFillColor: [238, 77, 90],
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
import {CartoLayer} from '@deck.gl/carto';
new CartoLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.7.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.7.0/dist.min.js"></script>
```

```js
new deck.carto.CartoLayer({});
```

## Properties

This layer allows to work with the different CARTO Maps API versions (v1, v2, and v3). When using version v1 and v2, the layer always works with vector tiles so it inherits all properties from [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md). When using v3, the layer works with vector tiles if the `type` property is `MAP_TYPES.TILESET` and with GeoJSON data if the `type` is `MAP_TYPES.QUERY` or `MAP_TYPES.TABLE`. When using GeoJSON data, the layer inherits all properties from [`GeoJsonLayer`](/docs/api-reference/layers/geojson-layer.md).

##### `data` (String)

Required. Either a SQL query or a name of dataset/tileset.

##### `type` (String)

Required. Data type. Possible values are:

- `MAP_TYPES.QUERY`, if `data` is a SQL query.
- `MAP_TYPES.TILESET`, if `data` is a tileset name.
- `MAP_TYPES.TABLE`, if `data` is a dataset name. Only supported with API v3.

##### `connection` (String)

Required when apiVersion is `API_VERSIONS.V3`.

Name of the connection registered in the CARTO workspace.

##### `geoColumn` (String, optional)

Only supported when apiVersion is `API_VERSIONS.V3` and `type` is `MAP_TYPES.TABLE`.

Name of the `geo_column` in the CARTO platform. Use this override the default column ('geom'), from which the geometry information should be fetched.

##### `columns` (Array, optional)

Only supported when apiVersion is `API_VERSIONS.V3` and `type` is `MAP_TYPES.TABLE`.

Names of columns to fetch. By default, all columns are fetched.

##### `uniqueIdProperty` (String)

- Default: `cartodb_id`

Optional. A string pointing to a unique attribute at the result of the query. A unique attribute is needed for highlighting with vector tiles when a feature is split across two or more tiles.

##### `credentials` (Object)

Optional. Overrides the configuration to connect with CARTO. Check the parameters [here](overview#carto-credentials).

### Callbacks

#### `onDataLoad` (Function, optional)

`onDataLoad` is called when the request to the CARTO Maps API was completed successfully.

- Default: `data => {}`

Receives arguments:

- `data` (Object) - Data received from CARTO Maps API

##### `onDataError` (Function, optional)

`onDataError` is called when the request to the CARTO Maps API failed. By default the Error is thrown.

- Default: `null`

Receives arguments:

- `error` (`Error`)

## Source

[modules/carto/src/layers/carto-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-layer.js)
