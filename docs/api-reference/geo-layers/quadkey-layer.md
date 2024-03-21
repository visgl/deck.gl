# QuadkeyLayer

import {QuadkeyLayerDemo} from '@site/src/doc-demos/geo-layers';

<QuadkeyLayerDemo />

The `QuadkeyLayer` renders filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system.

`QuadkeyLayer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {QuadkeyLayer} from '@deck.gl/geo-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     // Quadkey in SF Bay Area
   *     quadkey: "023012010333",
   *     value: 0.5979242952642347
   *   },
   *   {
   *     quadkey: "023012010332",
   *     value: 0.5446256069712141
   *   },
   *   ...
   * ]
   */
  const layer = new QuadkeyLayer({
    id: 'quadkey-layer',
    data,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getQuadkey: d => d.quadkey,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
    getElevation: d => d.value
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.quadkey} value: ${object.value}`} />;
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
import {QuadkeyLayer} from '@deck.gl/geo-layers';
new QuadkeyLayer({});
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
new deck.QuadkeyLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getQuadkey` ([Function](../../developer-guide/using-layers.md#accessors), optional) {#getquadkey}

Called for each data object to retrieve the quadkey string identifier.

* default: `object => object.quadkey`


## Sub Layers

The `QuadkeyLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all quadkey cells.


## Source

[modules/geo-layers/src/quadkey-layer](https://github.com/visgl/deck.gl/tree/9.0-release/modules/geo-layers/src/quadkey-layer)
