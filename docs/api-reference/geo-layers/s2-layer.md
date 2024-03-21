# S2Layer

import {S2LayerDemo} from '@site/src/doc-demos/geo-layers';

<S2LayerDemo />

The `S2Layer` renders filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system.

`S2Layer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {S2Layer} from '@deck.gl/geo-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     // S2 Cell in SF Bay Area
   *     token: "80858004",
   *     value: 0.5979242952642347
   *   },
   *   {
   *     token: "8085800c",
   *     value: 0.5446256069712141
   *   },
   *   ...
   * ]
   */
  const layer = new S2Layer({
    id: 's2-layer',
    data,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getS2Token: d => d.token,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
    getElevation: d => d.value
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.token} value: ${object.value}`} />;
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
import {S2Layer} from '@deck.gl/geo-layers';
new S2Layer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.1.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.1.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.1.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.1.0/dist.min.js"></script>
```

```js
new deck.S2Layer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getS2Token` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gets2token}

Called for each data object to retrieve the identifier of the S2 cell. May return one of the following:

- A string that is the cell's hex token
- A string that is the Hilbert quad key (containing `/`)
- A [Long](https://www.npmjs.com/package/long) object that is the cell's id

Check [S2 Cell](http://s2geometry.io/devguide/s2cell_hierarchy) for more details.

* default: `object => object.token`


## Sub Layers

The `S2Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all S2 cells.


## Source

[modules/geo-layers/src/s2-layer](https://github.com/visgl/deck.gl/tree/9.0-release/modules/geo-layers/src/s2-layer)

