<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# GPUGridLayer (Experimental)

The GPUGridLayer renders a grid heatmap based on an array of points.
It takes the constant cell size, aggregates input points in world space (lng/lat space).The color
and height of the cell is a linear function of number of points it contains.

GPUGridLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GridLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new GPUGridLayer({
    id: 'gpu-grid-layer',
    data,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Note:** This layer is similar to [GridLayer](/docs/layers/grid-layer.md) but supports aggregation on GPU using new prop `gpuAggregation`. Also several features of [GridLayer](/docs/layers/grid-layer.md) are not yet implemented and currently being worked on.



## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {_GPUGridLayer as GPUGridLayer} from '@deck.gl/aggregation-layers';
new GPUGridLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck._GPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSize` (Number, optional)

* Default: `1000`

Size of each cell in meters

##### `gpuAggregation` (bool, optional)

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 2 to 3 times faster depending upon number of points and number of cells.

NOTE: GPU Aggregation requires WebGL2 support by the browser. When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.

##### `coverage` (Number, optional)

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The final size of cell
is calculated by `coverage * cellSize`. Note: coverage does not affect how points
are binned. Coverage are linear based.

##### `elevationScale` (Number, optional)

* Default: `1`

Cell elevation multiplier. The elevation of cell is calculated by
`elevationScale * count`. `count` is number of points that fall into the cell.
`elevationScale` is a handy property to scale all cells without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cell will be flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.


## The following props of GridLayer are not supported yet

`colorDomain`, `colorRange`, `elevationDomain`,`elevationRange`, `upperPercentile` `lowerPercentile` `elevationUpperPercentile`, `elevationLowerPercentile`


## Source

[modules/aggregation-layers/src/gpu-grid-layer](https://github.com/uber/deck.gl/tree/7.0-release/modules/aggregation-layers/src/gpu-grid-layer)
