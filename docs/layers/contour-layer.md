<!-- INJECT:"GridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>


# ContourLayer

## About

`ContourLayer` renders contour lines for a given threshold and cell size. Internally it implements [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm to generate contour line segments and feeds them into `LineLayer` to render lines.

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
  const layer = new ContourLayer({
    id: 'contourLayer',
    // Three contours are rendered.
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 1},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 2},
      {threshold: 10, color: [0, 0, 255], strokeWidth: 5}
    ],
    cellSize: 200,
    getPosition: d => d.COORDINATES,
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
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

##### `contours` (Array, optional)

* Default: `[{threshold: 1}]`

Array of objects with following keys

* `threshold` (Number) : Threshold value to be used in contour generation.

* `color` (Array, optional) : RGB color array to be used to render contour lines, if not specified a default value of `[255, 255, 255]` is used.

* `strokeWidth` (Number, optional) : Width of the contour line in pixels, if not specified a default value of `1` is used.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

### Data Accessors

##### `getPosition` (Function, optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.


## Source

[modules/experimental-layers/src/contour-layer](https://github.com/uber/deck.gl/tree/master/modules/experimental-layers/src/contour-layer)
