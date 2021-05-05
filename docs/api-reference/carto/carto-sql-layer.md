

# CartoSQLLayer

`CartoSQLLayer` is the legacy layer to visualize data hosted in your CARTO account and to apply custom SQL.

Note:

- Our recommendation is to migrate the existing code to the new `CartoLayer` because this layer will be removed in a future version. 
 
With the legacy layer, your code looks like this:

```js
import DeckGL from '@deck.gl/react';
import {CartoSQLLayer, setDefaultCredentials} from '@deck.gl/carto';

setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoSQLLayer({
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 0.75],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

To migrate the code to use the new `CartoLayer`, you need to make the following changes:

- Use the `setConfig` function instead of the `setCredentials` function. Parameters are the same but you need to add the `apiVersion` property if you want to use v1 (the default `apiVersion` is v2)
- Instantiate a `CartoLayer` instead of a `CartoSQLLayer`. Comparing to the CartoSQLLayer instantiation, you need to provide one additional property: `type` with the value `MAP_TYPES.SQL`; the value `MAP_TYPES.TABLE` is not supported for API versions v1 and v2.

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setConfig, MAP_TYPES} from '@deck.gl/carto';

setConfig({
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.SQL,
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 0.75],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
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
import {CartoSQLLayer} from '@deck.gl/carto';
new CartoSQLLayer({});
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
new deck.carto.CartoSQLLayer({});
```


## Properties

Inherits all properties from [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md).


##### `data` (String)

Required. Either a sql query or a name of dataset

##### `uniqueIdProperty` (String)

* Default: `cartodb_id`

Optional. A string pointing to a unique attribute at the result of the query. A unique attribute is needed for highlighting a feature split across two or more tiles.

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
  sqlUrl: 'https://{user}.carto.com/api/v2/sql'
}
```

### Callbacks

#### `onDataLoad` (Function, optional)

`onDataLoad` is called when the request to the CARTO tiler was completed successfully.

* Default: `tilejson => {}`

Receives arguments:

* `tilejson` (Object) - the response from the tiler service

##### `onDataError` (Function, optional)

`onDataError` is called when the request to the CARTO tiler failed. By default the Error is thrown.

* Default: `null`

Receives arguments:

* `error` (`Error`)


## Source

[modules/carto/src/layers/carto-sql-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-sql-layer.js)
