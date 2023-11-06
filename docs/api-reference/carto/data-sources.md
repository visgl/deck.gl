# Data Sources

To ease interacting with the CARTO platform, the CARTO deck.gl module includes a number of functions, which simplify the use of fetching your data from CARTO. At a high level these can be thought of as wrappers around the browsers `fetch` function, except that rather than passing a URL, options that specify the data in the CARTO are used.

### Overview

The data source functions are a compact way to describe the data that you want to fetch. For example, to fetch a table from a data warehouse from the connection `carto_dw`:

```js
import {vectorTableSource} from '@deck.gl/carto';
const data = vectorTableSource({
  accessToken: 'XXX',
  connectionName: 'carto_dw',
  tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',
})
```

### Promise API

All data source functions return a Promise, which can be resolved to obtain the actual Tilejson. However, as the [core deck.gl Layer prop supports Promises](../core/layer#data), it is often not necessary to resolve or await the Promise and the data source can be directly passed to the data prop:

```jsx
import {H3TileLayer, h3TilesetSource} from '@deck.gl/carto';
new H3TileLayer({
  data: h3TilesetSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.h3_data'
  }),

  getFillColor: d => d.properties.color
});
```

### Types

All the data source functions are fully typed, to aid in providing the correct parameters and working correctly with the return value.

### Caching

The dataSource functions have an internal cache, which avoids fetching data from the server if the parameters have not changed. Thus they can be used, for example, in React `render()` functions without needing memoization.

### Available Data Sources

All data source functions take the following global options:

```ts
type SourceOptions = {
  accessToken: string;
  connectionName: string;
  apiBaseUrl?: string;
  clientId?: string;
  headers?: Record<string, string>;
  mapsUrl?: string;
};
```

In addition, the following options are supported on each source:

#### h3TableSource

```ts
type H3TableSourceOptions = {
  aggregationExp: string;
  aggregationResLevel?: number;
  columns?: string[];
  spatialDataColumn?: string;
  tableName: string;
}
```

#### h3QuerySource

```ts
type H3QuerySourceOptions = {
  aggregationExp: string;
  aggregationResLevel?: number;
  columns?: string[];
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters: QueryParameters;
}
```

#### h3TilesetSource

```ts
type H3TilesetSourceOptions = {
  tableName: string;
}
```

#### vectorTableSource

```ts
type vectorTableSourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  tableName: string;
}
```

#### vectorQuerySource

```ts
type vectorQuerySourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters: QueryParameters;
}
```

#### vectorTilesetSource

```ts
type vectorTilesetSourceOptions = {
  tableName: string;
}
```

#### rasterTilesetSource

```ts
type rasterTilesetSourceOptions = {
  tableName: string;
}
```

#### quadbinTableSource

```ts
type quadbinTableSourceOptions = {
  aggregationExp: string;
  aggregationResLevel?: number;
  columns?: string[];
  spatialDataColumn?: string;
  tableName: string;
}
```

#### quadbinQuerySource

```ts
type quadbinQuerySourceOptions = {
  aggregationExp: string;
  aggregationResLevel?: number;
  columns?: string[];
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters: QueryParameters;
}
```

#### quadbinTilesetSource

```ts
type quadbinTilesetSourceOptions = {
  tableName: string;
}
```

### QueryParameters

QueryParameters are used to parametrize SQL queries. The format depends on the source's provider, some examples:

[PostgreSQL and Redshift](https://node-postgres.com/features/queries):
```ts
vectorQuerySource({
  ...,
  sqlQuery: `select * from users where username=$1`,
  queryParameters: ['my-name']
})
```

[BigQuery positional](https://cloud.google.com/bigquery/docs/parameterized-queries#node.js):
```ts
vectorQuerySource({
  ...,
  sqlQuery: `select * from users where username=$1`,
  queryParameters: ['my-name']
})
```


[BigQuery named parameters](https://cloud.google.com/bigquery/docs/parameterized-queries#node.js):
```ts
vectorQuerySource({
  ...,
  sqlQuery: `select * from users where username=@username`,
  queryParameters: { username: 'my-name' }
})
```

[Snowflake positional](https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#binding-statement-parameters) :
```ts
vectorQuerySource({
  ...,
  sqlQuery: `select * from users where username=?`,
  queryParameters: ['my-name']
});
```

or

```ts
vectorQuerySource({
  data: `select * from users where username=:1`,
  queryParameters: ['my-name']
});
```

[Databricks ODBC](https://github.com/markdirish/node-odbc#bindparameters-callback)
```ts
vectorQuerySource({
  ...
  data: `select * from users where username=?`,
  queryParameters: ['my-name']
});
```
