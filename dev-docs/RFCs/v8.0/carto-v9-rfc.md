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
import {CartoVectorTableSource, VectorTileLayer} from '@deck.gl/carto';

const globalOptions = {
  accessToken: 'XXX',
  connectionName: 'my-connection',
}

// All options in one place
const options = {
  tableName: 'carto.example.table',
  columns: ['column1', 'column2']
}

// Returns a Promise which resolves to TileJSON payload. Can optionally await if needed
const data = CartoVectorTableSource({...globalOptions, ...options});

const layer = new VectorTileLayer({
  data,

  // ...style props
});
```

## Class names

The goal is to have descriptive names for classes and options, even if this means they are more verbose.

| Source class                | Options type                                          | Layer                   |
| --------------------------- | ----------------------------------------------------- | ----------------------- |
| `CartoVectorTableSource`    | `CartoTableSourceOptions`                             | `VectorTileLayer`       |
| `CartoVectorTilesetSource`  | `CartoTilesetSourceOptions`                           | `VectorTileLayer`       |
| `CartoVectorQuerySource`    | `CartoQuerySourceOptions`                             | `VectorTileLayer`       |
| `CartoH3TableSource`        | `CartoTableSourceOptions & CartoAggregationOptions`   | `CartoH3TileLayer`      |
| `CartoH3QuerySource`        | `CartoTilesetSourceOptions & CartoAggregationOptions` | `CartoH3TileLayer`      |
| `CartoH3TilesetSource`      | `CartoQuerySourceOptions`                             | `CartoH3TileLayer`      |
| `CartoQuadbinTableSource`   | `CartoTableSourceOptions & CartoAggregationOptions`   | `CartoQuadbinTileLayer` |
| `CartoQuadbinQuerySource`   | `CartoTilesetSourceOptions & CartoAggregationOptions` | `CartoQuadbinTileLayer` |
| `CartoQuadbinTilesetSource` | `CartoQuerySourceOptions`                             | `CartoQuadbinTileLayer` |
| `CartoRasterSource`         | `CartoTilesetSourceOptions`                           | `CartoRasterTileLayer`  |

### Options

Each of the `XXXSource` classes takes an options object as a constructor parameter, all inheriting from the common `CartoSourceOptions` base type and other options types to enforce the passing of the correct parameters to the API.

```javascript
export type CartoSourceOptions = {
  accessToken: string;
  apiBaseUrl?: string;
  clientId?: string;
  connectionName: string;
  format?: Format;
  formatTiles?: TileFormat;
  headers?: Record<string, string>;
  mapsUrl?: string;
};
```

#### CartoQuerySourceOptions

```javascript
export type CartoQuerySourceOptions = {
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters?: QueryParameters;
};
```

#### CartoTableSourceOptions

```javascript
export type CartoTableSourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  tableName: string;
};
```

#### CartoTilesetSourceOptions

```javascript
type CartoTilesetSourceOptions = CartoSourceOptions & {
  tableName: string
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

In the v9 API the `setDefaultCredentials` method is removed completely to avoid storing global state. Instead the `accessToken` must be passed to each Source manually, it is then up to the develop if they choose to build an abstraction, e.g. using the `withDefaults` helper.

### withDefaults helper function

A common use case is that a developer wants to use a single connection, access token, api base URL etc in their app, along with the defaults defined in `SOURCE_DEFAULTS`. In order to simplify this, a wrapper function - `withDefaults` - is provided to enable the following pattern:


```javascript
// Define in utility file
const defaults = {accessToken, apiBaseUrl, connectionName};
const AuthenticatedVectorTableSource = withDefaults<typeof CartoVectorTableSource>(
  CartoVectorTableSource,
  defaults
); // All other default values automatically added

// Use in app (with full type checking of options)
const layer = new VectorTileLayer({
  data: AuthenticatedVectorTableSource({tableName: 'my-table'})
  ...
});
```

### Automatic layer authentication

All of the Sources above require an `accessToken` parameter which will be use when fetching the TileJSON payload. Once the TileJSON is fetched, the access token will be added to the payload so the CartoXXXLayers can automatically read it, and append it to the `loadOptions`.

### MVT vs binary data format

Due to differences in data warehouses, when rendering vector data using the `VectorTileLayer` the format is MVT in some cases and CARTO's internal binary format in others. In v8 `CartoLayer` deals with this by instantiating either a `MVTLayer` or a `CartoTileLayer`.

The two layers are very similar (`CartoTileLayer` being an extension of `MVTLayer`) and thus in v9 `VectorTileLayer` will be enhanced to support MVT data so that it can be used with all data warehouses. `CartoTableSource`, `CartoTilesetSource` & `CartoQuerySource` will similarly be written such that they can parse both formats.

### React considerations

In React, the component will be re-rendered often and we want to avoid fetching the TileJSON every time. This can be achieved by using `useMemo`:

```jsx
function MyComponent(tableName) {
  const data = useMemo<CartoTilejsonResult>(() => {
    return AuthenticatedVectorTableSource({tableName});
  }, [tableName]);

  return new VectorTileLayer({
    data
    ...
  });
}
```
