# Data Sources

To ease interacting with the CARTO platform, the CARTO deck.gl module includes a number of functions, which simplify the use of fetching your data from CARTO. At a high level these can be thought of as wrappers around the browsers `fetch` function, except that rather than passing a URL, options that specify the data in the CARTO are used.

### Overview[​](#overview "Direct link to Overview")

The data source functions are a compact way to describe the data that you want to fetch. For example, to fetch a table from a data warehouse from the connection `carto_dw`:

```
import {vectorTableSource} from '@carto/api-client';

const data = vectorTableSource({

  accessToken: 'XXX',

  connectionName: 'carto_dw',

  tableName: 'carto-demo-data.demo_tables.chicago_crime_sample'

});
```

### Promise API[​](#promise-api "Direct link to Promise API")

All data source functions return a Promise, which can be resolved to obtain the actual Tilejson. However, as the [core deck.gl Layer prop supports Promises](https://deck.gl/next/docs/api-reference/core/layer.md#data), it is often not necessary to resolve or await the Promise and the data source can be directly passed to the data prop:

```
import {H3TileLayer} from '@deck.gl/carto';

import {h3TilesetSource} from '@carto/api-client';

new H3TileLayer({

  data: h3TilesetSource({

    accessToken: 'XXX',

    connectionName: 'carto_dw',

    tableName: 'carto-demo-data.demo_tables.h3_data'

  }),



  getFillColor: d => d.properties.color

});
```

### Types[​](#types "Direct link to Types")

All the data source functions are fully typed, to aid in providing the correct parameters and working correctly with the return value.

### Caching[​](#caching "Direct link to Caching")

The dataSource functions have an internal cache, which avoids fetching data from the server if the parameters have not changed. Thus they can be used, for example, in React `render()` functions without needing memoization.

### Available Data Sources[​](#available-data-sources "Direct link to Available Data Sources")

All data source functions take the following global options:

```
type SourceOptions = {

  accessToken: string;

  connectionName: string;

  apiBaseUrl?: string;

  clientId?: string;

  headers?: Record<string, string>;

  maxLengthURL?: number;

};
```

In addition, the following options are supported on each source:

#### vectorTableSource[​](#vectortablesource "Direct link to vectorTableSource")

```
type VectorTableSourceOptions = {

  columns?: string[];

  spatialDataColumn?: string;

  tableName: string;

  aggregationExp?: string;

};
```

#### vectorQuerySource[​](#vectorquerysource "Direct link to vectorQuerySource")

```
type VectorQuerySourceOptions = {

  spatialDataColumn?: string;

  sqlQuery: string;

  queryParameters: QueryParameters;

  aggregationExp?: string;

};
```

#### vectorTilesetSource[​](#vectortilesetsource "Direct link to vectorTilesetSource")

```
type VectorTilesetSourceOptions = {

  tableName: string;

};
```

#### h3TableSource[​](#h3tablesource "Direct link to h3TableSource")

```
type H3TableSourceOptions = {

  aggregationExp: string;

  aggregationResLevel?: number;

  columns?: string[];

  spatialDataColumn?: string;

  tableName: string;

};
```

#### h3QuerySource[​](#h3querysource "Direct link to h3QuerySource")

```
type H3QuerySourceOptions = {

  aggregationExp: string;

  aggregationResLevel?: number;

  spatialDataColumn?: string;

  sqlQuery: string;

  queryParameters: QueryParameters;

};
```

#### h3TilesetSource[​](#h3tilesetsource "Direct link to h3TilesetSource")

```
type H3TilesetSourceOptions = {

  tableName: string;

};
```

#### quadbinTableSource[​](#quadbintablesource "Direct link to quadbinTableSource")

```
type QuadbinTableSourceOptions = {

  aggregationExp: string;

  aggregationResLevel?: number;

  columns?: string[];

  spatialDataColumn?: string;

  tableName: string;

};
```

#### quadbinQuerySource[​](#quadbinquerysource "Direct link to quadbinQuerySource")

```
type QuadbinQuerySourceOptions = {

  aggregationExp: string;

  aggregationResLevel?: number;

  spatialDataColumn?: string;

  sqlQuery: string;

  queryParameters: QueryParameters;

};
```

#### quadbinTilesetSource[​](#quadbintilesetsource "Direct link to quadbinTilesetSource")

```
type QuadbinTilesetSourceOptions = {

  tableName: string;

};
```

#### rasterSource[​](#rastersource "Direct link to rasterSource")

```
type RasterSourceOptions = {

  tableName: string;

};
```

Boundary sources are sources where both the tileset and the properties props need a specific schema to work. [Read more about Boundaries in the CARTO documentation](https://docs.carto.com/carto-for-developers/guides/use-boundaries-in-your-application).

#### boundaryTableSource[​](#boundarytablesource "Direct link to boundaryTableSource")

```
type BoundaryTableSourceOptions = {

  tilesetTableName: string;

  columns?: string[];

  propertiesTableName: string;

};
```

#### boundaryQuerySource[​](#boundaryquerysource "Direct link to boundaryQuerySource")

```
type BoundaryQuerySourceOptions = {

  tilesetTableName: string;

  propertiesSqlQuery: string;

  queryParameters?: QueryParameters;

};
```

### QueryParameters[​](#queryparameters "Direct link to QueryParameters")

QueryParameters are used to parametrize SQL queries. The format depends on the source's provider, some examples:

[PostgreSQL and Redshift](https://node-postgres.com/features/queries):

```
vectorQuerySource({

  ...,

  sqlQuery: `select * from users where username=$1`,

  queryParameters: ['my-name']

})
```

[BigQuery positional](https://cloud.google.com/bigquery/docs/parameterized-queries#node.js):

```
vectorQuerySource({

  ...,

  sqlQuery: `select * from users where username=$1`,

  queryParameters: ['my-name']

})
```

[BigQuery named parameters](https://cloud.google.com/bigquery/docs/parameterized-queries#node.js):

```
vectorQuerySource({

  ...,

  sqlQuery: `select * from users where username=@username`,

  queryParameters: { username: 'my-name' }

})
```

[Snowflake positional](https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#binding-statement-parameters) :

```
vectorQuerySource({

  ...,

  sqlQuery: `select * from users where username=?`,

  queryParameters: ['my-name']

});
```

or

```
vectorQuerySource({

  data: `select * from users where username=:1`,

  queryParameters: ['my-name']

});
```

[Databricks ODBC](https://github.com/markdirish/node-odbc#bindparameters-callback)

```
vectorQuerySource({

  ...

  data: `select * from users where username=?`,

  queryParameters: ['my-name']

});
```
