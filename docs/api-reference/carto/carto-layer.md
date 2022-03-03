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

Inherits the properties of the [`GeoJsonLayer`](/docs/api-reference/layers/geojson-layer.md).

Additional properties may be available depending on the configuration. For details see: [Sublayer details](/docs/api-reference/carto/carto-layer#sublayer-details).

##### `data` (String)

Required. Either a SQL query or a name of dataset/tileset.

##### `type` (String)

Required. Data type. Possible values are:

- `MAP_TYPES.QUERY`, if `data` is a SQL query.
- `MAP_TYPES.TILESET`, if `data` is a tileset name.
- `MAP_TYPES.TABLE`, if `data` is a dataset name. Only supported with API v3.

##### `connection` (String)

Required when `apiVersion` is `API_VERSIONS.V3`.

Name of the connection registered in the CARTO workspace.

##### `format` (String, optional)

Only supported when `apiVersion` is `API_VERSIONS.V3`. Use to override the default data format. Possible values are: `FORMATS.GEOJSON`, `FORMATS.JSON` and `FORMATS.TILEJSON`. 

##### `formatTiles` (String, optional)

Only supported when `apiVersion` is `API_VERSIONS.V3` and `format` is `FORMATS.TILEJSON`. Use to override the default tile data format. Possible values are: `TILE_FORMATS.BINARY`, `TILE_FORMATS.GEOJSON` and `TILE_FORMATS.MVT`.

##### `geoColumn` (String, optional)

Only supported when `apiVersion` is `API_VERSIONS.V3` and `type` is `MAP_TYPES.TABLE`.

Name of the `geo_column` in the CARTO platform. Use this override the default column ('geom'), from which the geometry information should be fetched.

##### `columns` (Array, optional)

Only supported when `apiVersion` is `API_VERSIONS.V3` and `type` is `MAP_TYPES.TABLE`.

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

### SubLayers

The `CartoLayer` is a [`CompositeLayer`](/docs/api-reference/core/composite-layer.md), and will generate different sublayers depending on the configuration. In all cases, properties of the [`GeoJsonLayer`](/docs/api-reference/layers/geojson-layer.md) will be inherited.

#### API v1 & v2

`CartoLayer` works with the different CARTO Maps API versions (v1, v2, and v3). When using version v1 and v2, the layer always works with vector tiles so it inherits all properties from [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md).

#### API v3

When using v3, the behavior depends on the `type` property.

##### `MAP_TYPES.QUERY`

GeoJSON/JSON data will be used, depending on `format`. A [`GeoJSONLayer`](/docs/api-reference/layers/geojson-layer.md) will be created.

##### `MAP_TYPES.TILESET`

Tiled data will be used, depending on `formatTiles`. A [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md) will be created and all properties will be inherited.

##### `MAP_TYPES.TABLE`

Automatically based on the size of the table CARTO will decide whether to use tiles or a full document.

For a full document a [`GeoJSONLayer`](/docs/api-reference/layers/geojson-layer.md) will be created, while for tiles a vector tile layer that extends the current [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md) and inherits all the properties will be created.

Tiles can be forced by setting `format` to `FORMATS.TILEJSON`.

## Source

[modules/carto/src/layers/carto-layer.js](https://github.com/visgl/deck.gl/tree/8.7-release/modules/carto/src/layers/carto-layer.js)
