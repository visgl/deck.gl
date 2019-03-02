# GPUGridLayer

## About

The GPUGridLayer renders a grid heatmap based on an array of points.
It takes the constant cell size, aggregates input points in world space (lng/lat space).The color
and height of the cell is a linear function of number of points it contains.

GPUGridLayer is a `CompositeLayer`

```js
import DeckGL, {GridLayer} from 'deck.gl';

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

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.


## Following props of GridLyer are not supported yet.

`colorDomain`, `colorRange`, `elevationDomain`,`elevationRange`, `upperPercentile` `lowerPercentile` `elevationUpperPercentile`, `elevationLowerPercentile`


## Source

[modules/experimental-layers/src/gpu-grid-layer](https://github.com/uber/deck.gl/tree/master/modules/experimental-layers/src/gpu-grid-layer)
