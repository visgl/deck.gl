

# CartoSQLLayer

`CartoSQLLayer` is a layer to visualize data hosted in your CARTO account and to apply custom SQL.

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
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
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


##### `credentials` (Object)

Optional. Object with the credentials to connect with CARTO.

* Default:

```js
{
  username: 'public',
  apiKey: 'default_public',
  serverUrlTemplate: 'https://{user}.carto.com'
}
```

##### `bufferSize` (Number)

Optional. MVT BufferSize in pixels

* Default: `1`

##### `version` (String)

Optional. MapConfig version

* Default: `1.3.1`


##### `tileExtent` (String)

Optional. Tile extent in tile coordinate space as defined by MVT specification.

* Default: `4096`


## Source

[modules/carto/src/layers/carto-sql-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-sql-layer.js)
