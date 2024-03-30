# GeohashLayer

import {GeohashLayerDemo} from '@site/src/doc-demos/geo-layers';

<GeohashLayerDemo/>

The `GeohashLayer` renders filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system.

`GeohashLayer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GeohashLayer} from '@deck.gl/geo-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     // Geohash in SF Bay Area
   *     geohash: "9q8yv",
   *     value: 0.7668453218020029
   *   },
   *   {
   *     geohash: "9q8yyp",
   *     value: 0.8789404786833306
   *   },
   *   ...
   * ]
   */
  const layer = new GeohashLayer({
    id: 'geohash-layer',
    data,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getGeohash: d => d.geohash,
    getFillColor: d => [d.value * 255, (1 - d.value) * 128, (1 - d.value) * 255],
    getElevation: d => d.value
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.geohash} value: ${object.value}`} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {GeohashLayer} from '@deck.gl/geo-layers';
new GeohashLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.7.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.7.0/dist.min.js"></script>
```

```js
new deck.GeohashLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getGeohash` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getgeohash}

Called for each data object to retrieve the geohash string identifier.

* default: `object => object.geohash`


## Sub Layers

The `GeohashLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all geohash cells.


## Source

[modules/geo-layers/src/geohash-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/geohash-layer)
