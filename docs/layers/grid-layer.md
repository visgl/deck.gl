<!-- INJECT:"GridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# GridLayer

The Grid Layer renders a grid heatmap based on an array of points.
It takes the constant size all each cell, projects points into cells. The color
and height of the cell is scaled by number of points it contains.
[Source](https://github.com/uber/deck.gl/tree/master/src/layers/core/grid-layer)

```js
import DeckGL, {GridLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7]},
   *   ...
   * ]
   */
  const layer = new GridLayer({
    id: 'grid-layer',
    data,
    cellSize: 500
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Remark:** GridLayer at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

### Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `cellSize` (Number, optional)

- Default: `1000`

Size of each cell in meters

##### `colorDomain` (Array, optional)

- Default: `[min(count), max(count)]`

Color scale domain, default is set to the range of point counts in each cell.

##### `colorRange` (Array, optional)

- Default: <img src="/demo/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Color ranges as an array of colors formatted as `[255, 255, 255]`. Default is
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `elevationDomain` (Array, optional)

- Default: `[0, max(count)]`

Elevation scale input domain, default is set to the extent of point counts in each cell.

##### `elevationRange` (Array, optional)

- Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional)

- Default: `1`

Cell elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`.
`elevationScale` is a handy property to scale all cells without updating the data.

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cell will be flat.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each point.
