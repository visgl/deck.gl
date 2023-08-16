# CARTO v9 API RFC

- **Author**: Felix Palmer
- **Date**: August 2023
- **Status**: **Pending Review**

## Overview

@deck.gl/carto was created in version [v8.3 (Oct 12, 2020)](https://deck.gl/docs/whats-new#deckgl-v83), since then the platform has evolved a lot. The following major changes have been addressed progressively:

- When it was created we only supported Query Layers and MVT format. It now supports Queries, Tables, Tilesets, Rasters, H3, and Quadbin.
- It only supported PostgreSQL, today we support: PostgreSQL + BigQuery + Snowflake + Redshift + Databricks.
- Parametrized queries were introduced for better control of queries in public applications.
- In v9 of deck.gl we will have Typescript.

As the CARTO platform has grown, the CartoLayer has been used to implement a wide variety of functions, with the result that it can be unclear to developers what is going on:

- The primitive layer used for rendering is obscured from the user, e.g if `geoColumn=geom` it will use a `GeoJsonLayer`, if `geoColumn=h3|quadbin` `H3HexagonLayer` or `QuadbinLayer` will be used.
- Props are dependent on the layer type being used, e.g. `aggregationExp` has no meaning for non-spatial index datasets. `QueryParameters` are only available for `Query` layers.
- No easy way for the developer to use a custom layer for rendering.
- No types to enforce correct options.

We are working right now in v9, so I think it's a great time to address those changes. Especially because v9 will expose types at the package roots.

## Background

The current implementation of `CartoLayer` is as a `CompositeLayer` which encapsulates all the data loading via the CARTO API, and depending on the particular configuration of props renders the data using one of the following layers:

- `CartoTileLayer`
- `H3TileLayer`
- `MVTLayer`
- `RasterTileLayer`
- `QuadbinTileLayer`

The standard pattern in deck.gl is for a `data` prop of `Layer` to accept the actual data to be visualized, or a Promise that resolves to the data. The `MVTLayer` additionally [accepts TileJSON](https://deck.gl/docs/api-reference/geo-layers/mvt-layer#data) as input, as do all the CARTO Layers.

## API background

Without getting into the details too much, using the current `CartoLayer` with the CARTO works in the following way:

1. User configures `CartoLayer` with a set of props
2. `CartoLayer` uses these props to construct a URL for a Map Instantiation request
3. `CartoLayer` performs a Map Instantiation fetch request and obtains URLs for data endpoints, in different formats: TileJSON, GeoJSON, JSON etc
4. `CartoLayer` is [hardcoded](https://github.com/visgl/deck.gl/blob/master/modules/carto/src/layers/carto-layer.ts#L263) to only use TileJSON, so the TileJSON URL is fetched
5. `CartoLayer` [decides](https://github.com/visgl/deck.gl/blob/master/modules/carto/src/api/layer-map.ts#L203-L223) which Layer to use for rendering and passes the TileJSON payload to that layer in the `data` prop

## Proposal

At a high level we want to achieve an API which makes it clearer to the user what is going on, and allows for better extensibility. We also want to separate the options used for loading the data from the props which style the layer.

To do so, the interaction with the CARTO API will be done via a set of typed helper classes which aid the user in obtaining the TileJSON needed for a particular layer.

```javascript
import {CartoQuerySource, CartoQuerySourceOptions, CartoVectorLayer} from '@deck.gl/carto';

// Global options
setDefaultCredentials({accessToken: 'XXXX'});

// All properties in one place
const options: CartoQuerySourceOptions = {
  connectionName: 'bigquery',
  sqlQuery: 'select * from carto.tables.example'
}

// Returns a Promise which resolves to TileJSON payload. Can optionally await if needed
const data = CartoQuerySource(options);

const layer = new CartoVectorLayer({
  data,

  // ...style props
});
```

## Class names

The goal is to have descriptive names for classes and options, even if this means they are more verbose.

| Source class                | Options type                                          | Layer                   |
| --------------------------- | ----------------------------------------------------- | ----------------------- |
| `CartoVectorTableSource`    | `CartoTableSourceOptions`                             | `CartoVectorLayer`      |
| `CartoVectorTilesetSource`  | `CartoTilesetSourceOptions`                           | `CartoVectorLayer`      |
| `CartoVectorQuerySource`    | `CartoQuerySourceOptions`                             | `CartoVectorLayer` |
| `CartoH3TableSource`        | `CartoTableSourceOptions & CartoAggregationOptions`   | `CartoH3TileLayer`      |
| `CartoH3QuerySource`        | `CartoTilesetSourceOptions & CartoAggregationOptions` | `CartoH3TileLayer`      |
| `CartoH3TilesetSource`      | `CartoQuerySourceOptions`                             | `CartoH3TileLayer`      |
| `CartoQuadbinTableSource`   | `CartoTableSourceOptions & CartoAggregationOptions`   | `CartoQuadbinTileLayer` |
| `CartoQuadbinQuerySource`   | `CartoTilesetSourceOptions & CartoAggregationOptions` | `CartoQuadbinTileLayer` |
| `CartoQuadbinTilesetSource` | `CartoQuerySourceOptions`                             | `CartoQuadbinTileLayer` |
| `CartoRasterSource`         | `CartoTilesetSourceOptions`                           | `CartoRasterTileLayer`  |

### Options

Each of the `XXXSource` classes takes an options object as a constructor parameter, all inheriting from the common `CartoSourceOptions` base type.

```javascript
type CartoSourceOptions = {
  apiVersion?: '3.2', // Default '3.2'
  apiBaseUrl?: 'string', // Default 'https://gcp-us-east1.api.carto.com' or global apiBaseUrl
  accessToken?: 'string', // Default to global access token
  connectionName: string,
  clientId?: string, // Default 'deck-gl-carto'
  formatTiles?: TileFormat,
  headers?: Headers,
  mapsUrl?: string; // Default `${apiBaseUrl}/v3/maps`
};

```

#### CartoTableSourceOptions

```javascript
type CartoTableSourceOptions = CartoSourceOptions & {
  columns?: string[],
  spatialDataColumn?: string,
  tableName: string
};
```

#### CartoTilesetSourceOptions

```javascript
type CartoTilesetSourceOptions = CartoSourceOptions & {
  tableName: string
};
```

#### CartoQuerySourceOptions

```javascript
type CartoQuerySourceOptions = CartoSourceOptions & {
  spatialDataColumn?: string,
  sqlQuery: string,
  queryParameters?: QueryParameters
};
```

#### CartoAggregationOptions

```javascript
type CartoAggregationOptions = {
  aggregationExp?: string,
  aggregationResLevel?: number
};
```

## Implementation details

### Authorization

To authenticate with the API, the user must provide an access token, which may be different on a per-layer basis. There two ways to achieve this in `v8.X`:

```javascript
// Global
setDefaultCredentials({accessToken: 'XXX'});

// Layer-specific
new CartoLayer({
  credentials: {accessToken: 'XXX'}
});
```

The [options](https://github.com/visgl/deck.gl/blob/master/modules/carto/src/config.ts#L22-L25) used in the `credentials` Object are only needed for the Map Instantiation and the `XXXTileLayer`s do not need to know about them (all the context is already in the `tiles` URL). The exception is the access token, which must be present on the tile requests.

For the global configuration case the `XXXTileLayers` can read the configured access token automatically, but for the per-Layer specification the `XXXTileLayer` needs to use the access token in the header:

```javascript
new CartoVectorLayer({
  loadOptions: {
    fetch: {
      headers: {Authorization: `Bearer ${accessToken}`}
    }
  })
});
```

This is in line with [deck.gl docs](https://deck.gl/docs/developer-guide/loading-data#example-fetch-data-with-credentials) and also makes it clearer how to set custom headers on the requests.

### MVT vs binary data format

Due to differences in data warehouses, when rendering vector data using the `CartoVectorLayer` the format is MVT in some cases and CARTO's internal binary format in others. In v8 `CartoLayer` deals with this by instantiating either a `MVTLayer` or a `CartoTileLayer`.

The two layers are very similar (`CartoTileLayer` being an extension of `MVTLayer`) and thus in v9 `CartoTileLayer` will be enhanced to support MVT data so that it can be used with all data warehouses. `CartoTableSource`, `CartoTilesetSource` & `CartoQuerySource` will similarly be written such that they can parse both formats.
