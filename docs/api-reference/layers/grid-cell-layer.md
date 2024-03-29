# GridCellLayer

import {GridCellLayerDemo} from '@site/src/doc-demos/layers';

<GridCellLayerDemo />

> This is the primitive layer rendered by [CPUGridLayer](../aggregation-layers/cpu-grid-layer.md) after aggregation. Unlike the CPUGridLayer, it renders one column for each data object.

The `GridCellLayer` can render a grid-based heatmap.
It is a variation of the [ColumnLayer](./column-layer.md).
It takes the constant width / height of all cells and bottom-left coordinate of
each cell. The grid cells can be given a height using the `getElevation` accessor.

```js
import DeckGL from '@deck.gl/react';
import {GridCellLayer} from '@deck.gl/layers';

function App({data, viewState}) {
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
    getElevation: d => d.value
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `height: ${object.value * 5000}m`} />;
}
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
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.GridCellLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

##### `cellSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each grid cell in meters

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Cell size scale factor. The size of cell is calculated by
`cellSize * coverage`.

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all cell elevations without updating the data.

##### `extruded` (Boolean, optional) {#extruded}

* Default: `true`

Whether to enable grid elevation. If set to false, all grid will be flat.

##### `material` (Object, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors

##### `getPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `x => x.position`

Method called to retrieve the bottom-left corner (`[minX, minY]`) of each cell.


##### `getColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Source

[modules/layers/src/column-layer/grid-cell-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/column-layer/grid-cell-layer.ts)
