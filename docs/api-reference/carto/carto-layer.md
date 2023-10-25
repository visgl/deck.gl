# CartoLayer

`CartoLayer` is the layer to visualize data using the CARTO Maps API.

## Usage 

### Geometry data

By default the `CartoLayer` expects the data to be described using longitude & latitude. Tiled data will be used, with the format depending on `formatTiles`.
A [`MVTLayer`](../geo-layers/mvt-layer.md) will be created and all properties will be inherited.

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS} from '@deck.gl/carto';

setDefaultCredentials({
  accessToken: 'XXX'
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com' // Default value (optional)
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

### Spatial index data

The CARTO platform supports storing data using a spatial index. The `geoColumn` prop is used to specify a database column that contains geographic data. When `geoColumn` has one of the following values, the data will be interpreted as a spatial index:

- `h3` [H3](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#h3) indexing system will be used
- `quadbin` [Quadbin](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) indexing system will be used

Tiled data will be used, with the layer created depending on the spatial index used:

- `h3` [`H3HexagonLayer`](../geo-layers/h3-hexagon-layer.md) will be created and all properties will be inherited.
- `quadbin` [`QuadkeyLayer`](../geo-layers/quadkey-layer.md) will be created and all properties will be inherited. _Note the `getQuadkey` accessor is replaced with `getQuadbin`_.

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS} from '@deck.gl/carto';

setDefaultCredentials({
  accessToken: 'XXX'
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com' // Default value (optional)
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.TABLE,
    connection: 'bigquery',
    data: 'cartobq.testtables.h3',
    geoColumn: 'h3',
    aggregationExp: 'AVG(population) as population',
    getFillColor: [238, 77, 90],
    getElevation: d => d.properties.population
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

### Raster data (experimental)

The CARTO platform supports storing data in raster format. When the `CartoLayer` is created with type `MAP_TYPES.RASTER` data will be loaded as tiled raster data, and a layer derived from [`ColumnLayer`](../layers/column-layer.md) will be created and a subset of properties will be inherited.

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, MAP_TYPES} from '@deck.gl/carto';

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.RASTER,
    connection: 'bigquery',
    data: 'cartobq.public_account.temperature_raster',
    getFillColor: d => {
      const {band_1} = d.properties;
      return [10 * (band_1 - 20), 0, 300 - 5 * band_1];
    }
  })

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

In all cases the properties of [`TileLayer`](../geo-layers/tile-layer.md) will be inherited.

Depending on the datasource, additional properties will be inherited from the created sublayer:

- For the `h3` spatial index: [`H3HexagonLayer`](../geo-layers/h3-hexagon-layer.md).
- For the `quadbin` spatial index: [`QuadkeyLayer`](../geo-layers/quadkey-layer.md). _Note the `getQuadkey` accessor is replaced with `getQuadbin`_.
- Otherwise (longitude/latitude): [`MVTLayer`](../geo-layers/mvt-layer.md).


##### `data` (String) {#data}

Required. Either a SQL query or a name of dataset/tileset.

##### `type` (String) {#type}

Required. Data type. Possible values are:

- `MAP_TYPES.QUERY`, if `data` is a SQL query.
- `MAP_TYPES.TILESET`, if `data` is a tileset name.
- `MAP_TYPES.TABLE`, if `data` is a dataset name. Only supported with API v3.
- `MAP_TYPES.RASTER`, if `data` is a raster name. Experimental, only supported with API v3.

##### `connection` (String, optional) {#connection}

Required when `apiVersion` is `API_VERSIONS.V3`.

Name of the connection registered in the CARTO workspace.

##### `formatTiles` (String, optional) {#formattiles}

Only supported when `apiVersion` is `API_VERSIONS.V3` and `format` is `FORMATS.TILEJSON`. Use to override the default tile data format. Possible values are: `TILE_FORMATS.BINARY`, `TILE_FORMATS.GEOJSON` and `TILE_FORMATS.MVT`.

##### `geoColumn` (String, optional) {#geocolumn}

Only supported when `type` is `MAP_TYPES.TABLE`.

Name of the `geo_column` in the CARTO platform. Use this override the default column ('geom'), from which the geometry information should be fetched.

##### `columns` (Array, optional) {#columns}

Only supported when `type` is `MAP_TYPES.TABLE`.

Names of columns to fetch. By default, all columns are fetched.

##### `uniqueIdProperty` (String, optional) {#uniqueidproperty}

- Default: `cartodb_id`

A string pointing to a unique attribute at the result of the query. A unique attribute is needed for highlighting with vector tiles when a feature is split across two or more tiles.

##### `credentials` (Object, optional) {#credentials}

Overrides the configuration to connect with CARTO. Check the parameters [here](overview#carto-credentials).

##### `headers` (Object, optional) {#headers}

Custom headers to include in the map instantiation request.

##### `aggregationExp` (String, optional) {#aggregationexp}

Aggregation SQL expression. Only used for spatial index datasets.

##### `aggregationResLevel` (Number, optional) {#aggregationreslevel}

Aggregation resolution level. Only used for spatial index datasets, defaults to 6 for quadbins, 4 for h3.


### Callbacks

#### `onDataLoad` (Function, optional) {#ondataload}

`onDataLoad` is called when the request to the CARTO Maps API was completed successfully.

- Default: `data => {}`

Receives arguments:

- `data` (Object) - Data received from CARTO Maps API

##### `onDataError` (Function, optional) {#ondataerror}

`onDataError` is called when the request to the CARTO Maps API failed. By default the Error is thrown.

- Default: `null`

Receives arguments:

- `error` (`Error`)

## Source

[modules/carto/src/layers/carto-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-layer.ts)
