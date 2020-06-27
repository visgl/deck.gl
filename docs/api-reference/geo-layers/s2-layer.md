import {S2LayerDemo} from 'website-components/doc-demos/geo-layers';

<S2LayerDemo />

<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# S2Layer

The S2Layer renders filled and/or stroked polygons, with geometry automatically calculated based on an S2 token (geospatial index). It uses Uses the [`s2-geometry`](http://s2geometry.io/) library for S2 polygon calculations.

`S2Layer` is a [CompositeLayer](/docs/api-reference/core/composite-layer.md).

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

Inherits from all [Base Layer](/docs/api-reference/core/layer.md), [CompositeLayer](/docs/api-reference/core/composite-layer.md), and [PolygonLayer](/docs/api-reference/layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getS2Token` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

Called for each data object to retrieve the identifier of the S2 cell. May return one of the following:

- A string that is the cell's hex token
- A string that is the Hilbert quad key (containing `/`)
- A [Long](https://www.npmjs.com/package/long) object that is the cell's id

Check [S2 Cell](http://s2geometry.io/devguide/s2cell_hierarchy) for more details.

* default: `object => object.token`


## Sub Layers

The `S2Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](/docs/api-reference/layers/polygon-layer.md) rendering all S2 cells.


## Source

[modules/geo-layers/src/s2-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/s2-layer)

