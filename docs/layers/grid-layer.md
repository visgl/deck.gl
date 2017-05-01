<!-- INJECT:"GridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# GridLayer

The Grid Layer renders a grid heatmap based on an array of points.
It takes the constant size all each cell, projects points into cells. The color
and height of the cell is scaled by number of points it contains.

GridLayer is a `CompositeLayer`

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

**Note:** The `GridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

## Properties

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

##### `getColorValue` (Function, optional)

- Default: `points => points.length`

`getColorValue` is the accessor function to get the value that cell color is based on. 
It takes an array of points inside each cell as arguments, returns a number. For example, 
You can pass in `getColorValue` to color the cells by avg/mean/max of a specific attributes of each point.
By default `getColorValue` returns the length of the points array.

Note: grid layer compares whether `getColorValue` has changed to
recalculate the value for each bin that its color based on. You should
pass in the function defined outside the render function so it doesn't create a 
new function on every rendering pass. 

```
 class MyGridLayer {
    getColorValue (points) {
        return points.length;
    }
    
    renderLayers() {
      return new GridLayer({
        id: 'grid-layer',
        getColorValue: this.getColorValue // instead of getColorValue: (points) => { return points.length; }
        data,
        cellSize: 500
      });
    }
 }
```

##### `coverage` (Number, optional)

- Default: `1`

Cell size multiplier, clamped between 0 - 1. The final size of cell
is calculated by `coverage * cellSize`. Note: coverage does not affect how points
are binned. Coverage are linear based.

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

##### `upperPercentile` (Number, optional)

- Default: `100`

Filter cells and re-calculate color by `upperPercentile`. Cells with value
larger than the upperPercentile will be hidden.

##### `lowerPercentile` (Number, optional)

- Default: `0`

Filter bins and re-calculate color by `lowerPercentile`. Cells with value
smaller than the lowerPercentile will be hidden.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional)

**EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each point.

## Source
[src/layers/core/grid-layer](https://github.com/uber/deck.gl/tree/4.0-release/src/layers/core/grid-layer)


