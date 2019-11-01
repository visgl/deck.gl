
<!-- INJECT:"GridCellLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# GridCellLayer

> This is the primitive layer rendered by [CPUGridLayer](/docs/layers/cpu-grid-layer.md) after aggregation. Unlike the CPUGridLayer, it renders one column for each data object.

The GridCellLayer can render a grid-based heatmap.
It is a variation of the [ColumnLayer](/docs/layers/column-layer.md).
It takes the constant width / height of all cells and top-left coordinate of
each cell. The grid cells can be given a height using the `getElevation` accessor.

```js
import DeckGL from '@deck.gl/react';
import {GridCellLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {centroid: [-122.4, 37.7], value: 100},
   *   ...
   * ]
   */
  const layer = new GridCellLayer({
    id: 'grid-cell-layer',
    data,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getFillColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value,
    onHover: ({object, x, y}) => {
      const tooltip = `height: ${object.value * 5000}m`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {GridCellLayer} from '@deck.gl/layers';
new GridCellLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.GridCellLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Size of each grid cell in meters

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Cell size scale factor. The size of cell is calculated by
`cellSize * coverage`.

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all cell elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to enable grid elevation. If set to false, all grid will be flat.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x => x.position`

Method called to retrieve the top left corner of each cell.
Expecting [lon, lat].

##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Source

[modules/layers/src/grid-cell-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/column-layer/grid-cell-layer.js)
