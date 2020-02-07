<!-- INJECT:"ContourLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
</p>


# ContourLayer

`ContourLayer` renders `Isoline`s or `Isoband`s for a given threshold and cell size. `Isoline` represents collection of line segments that separate the area above and below a given threshold. `Isoband` represents a collection of polygons (filled) that fill the area containing values in a given threshold range. To generate an `Isoline` single threshold value is needed, to generate an `Isoband` an Array with two values needed. Data is first aggregated using given cell size and resulting scalar field is used to run [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm that generates a set of vertices to form Isolines or Isobands. In below documentation `Isoline` and `Isoband` is referred as `contour`.


```js
import DeckGL from '@deck.gl/react';
import {ContourLayer} from '@deck.gl/aggregation-layers';

const CONTOURS = [
  {threshold: 1, color: [255, 0, 0, 255], strokeWidth: 1}, // => Isoline for threshold 1
  {threshold: 5, color: [0, 255, 0], strokeWidth: 2}, // => Isoline for threshold 5
  {threshold: [6, 10], color: [0, 0, 255, 128]} // => Isoband for threshold range [6, 10)
];

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
    contours: CONTOURS,
    cellSize: 200,
    getPosition: d => d.COORDINATES,
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {ContourLayer} from '@deck.gl/aggregation-layers';
new ContourLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.ContourLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Size of each cell in meters

##### `gpuAggregation` (bool, optional)

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 2 to 3 times faster depending upon number of points and number of cells.

NOTE: GPU Aggregation requires WebGL2 support by the browser. When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.

##### `aggregation` (String, optional)

* Default: 'SUM'

Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. When no value or an invalid value is set, 'SUM' is used as aggregation.

* SUM : Grid cell contains sum of all weights that fall into it.
* MEAN : Grid cell contains mean of all weights that fall into it.
* MIN : Grid cell contains minimum of all weights that fall into it.
* MAX : Grid cell contains maximum of all weights that fall into it.


##### `contours` (Array, optional)

* Default: `[{threshold: 1}]`

Array of objects with following keys

* `threshold` (Number or Array) :

  - Isolines: `threshold` value must be a single `Number`, Isolines are generated based on this threshold value.
  - Isobands: `threshold` value must be an Array of two `Number`s. Isobands are generated using `[threshold[0], threshold[1])` as threshold range, i.e area that has values `>= threshold[0]` and `< threshold[1]` are rendered with corresponding color. NOTE: `threshold[0]` is inclusive and `threshold[1]` is not inclusive.

* `color` (Array, optional) : RGBA color array to be used to render the contour, if not specified a default value of `[255, 255, 255, 255]` is used. When a three component RGB array specified, a default value of 255 is used for Alpha.

* `strokeWidth` (Number, optional) : Applicable for `Isoline`s only, width of the Isoline in pixels, if not specified a default value of `1` is used.

* `zIndex` (Number, optional) : Defines z order of the contour. Contour with higher `zIndex` value is rendered above contours with lower `zIndex` values. When visualizing overlapping contours, `zIndex` along with `zOffset` (defined below) can be used to precisely layout contours. This also avoids z-fighting rendering issues. If not specified a unique value from `0` to `n` (number of contours) is assigned.

NOTE: Like any other layer prop, a shallow comparison is performed on `contours` prop to determine if it is changed. This prop should be set to an array object, that changes only when contours need to be changed.

##### `zOffset` (Number, optional)

* Default: `0.005`

A very small z offset that is added for each vertex of a contour (Isoline or Isoband). This is needed to control the layout of contours, especially when rendering overlapping contours. Imagine a case where an Isoline is specified which is overlapped with an Isoband. To make sure the Isoline is visible we need to render this above the Isoband.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.

##### `getWeight` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => 1`

Method called to retrieve weight of each point. By default each point will use a weight of `1`.


## Sub Layers

The `ContourLayer` renders the following sublayers:

* `lines` - For Isolines, rendered by [LineLayer](/docs/layers/line-layer.md)
* `bands` - For Isobands, rendered by [SolidPolygonLayer](/docs/layers/solid-polygon-layer.md)


## Source

[modules/aggregation-layers/src/contour-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/contour-layer)
