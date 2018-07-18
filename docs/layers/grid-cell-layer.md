<div align="center">
  <img height="300" src="/website/src/static/images/grid-layer.gif" />
</div>

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# GridCellLayer

The Grid Cell Layer can render a grid-based heatmap.
It takes the constant width / height of all cells and top-left coordinate of
each cell. The grid cells can be given a height using the `getElevation` accessor.

```js
import DeckGL, {GridCellLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7], color: [255, 0, 0], elevation: 100},
   *   ...
   * ]
   */
  const layer = new GridCellLayer({
    id: 'grid-cell-layer',
    data,
    cellSize: 500
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSize` (Number, optional)

* Default: `1000`

Size of each grid cell in meters

##### `coverage` (Number, optional)

* Default: `1`

Cell size scale factor. The size of cell is calculated by
`cellSize * coverage`.

##### `elevationScale` (Number, optional)

* Default: `1`

Elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all cell elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to enable grid elevation. If se to false, all grid will be flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `cell => cell.position`

Method called to retrieve the top left corner of each cell.
Expecting [lon, lat].

##### `getElevation` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Method called to retrieve the elevation of each cell.
Expecting a number, 1 unit approximate to 100 meter

##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

## Source

[modules/core/src/core-layers/grid-cell-layer](https://github.com/uber/deck.gl/tree/6.0-release/modules/layers/src/grid-cell-layer)

