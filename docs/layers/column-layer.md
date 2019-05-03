<!-- INJECT:"ColumnLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# ColumnLayer

> This is the primitive layer rendered by [HexagonLayer](/docs/layers/hexagon-layer.md) after aggregation. Unlike the HexagonLayer, it renders one column for each data object.

The ColumnLayer can be used to render a heatmap of vertical cylinders. It renders a tesselated regular polygon centered at each given position (a "disk"), and extrude it in 3d.

```js
import DeckGL from '@deck.gl/react';
import {ColumnLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {centroid: [-122.4, 37.7], value: 0.2},
   *   ...
   * ]
   */
  const layer = new ColumnLayer({
    id: 'column-layer',
    data,
    diskResolution: 12,
    radius: 250,
    extruded: true,
    pickable: true,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
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
import {ColumnLayer} from '@deck.gl/layers';
new ColumnLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.ColumnLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `diskResolution` (Number, optional)

* Default: `20`

The number of sides to render the disk as. The disk is a regular polygon that fits inside the given radius. A higher resolution will yield a smoother look close-up, but also need more resources to render.

##### `radius` (Number, optional)

* Default: `1000`

Disk radius in meters.

##### `angle` (Number, optional)

* Default: `0`

Disk rotation, counter-clockwise in degrees.

##### `vertices` (Array, optional)

Replace the default geometry (regular polygon that fits inside the unit circle) with a custom one. The length of the array must be at least `diskResolution`. Each vertex is a point `[x, y]` that is the offset from the instance position, relative to the radius.

##### `offset` ([Number, Number], optional)

* Default: `[0, 0]`

Disk offset from the position, relative to the radius. By default, the disk is centered at each position.

##### `coverage` (Number, optional)

* Default: `1`

Radius multiplier, between 0 - 1. The radius of the disk is calculated by
`coverage * radius`

##### `filled` (Boolean, optional)

* Default: `true`

Whether to draw a filled polygon (solid fill). Note that only
the area between the outer polygon and any holes will be filled.

##### `elevationScale` (Number, optional)

* Default: `1`

Column elevation multiplier. The elevation of column is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all hexagon elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to extrude hexagon. If se to false, all hexagons will be set to flat.

##### `wireframe` (Boolean, optional)

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Requires the `extruded` prop to be true.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.position`

Method called to retrieve the position of each column, in `[x, y]`. An optional third component can be used to set the elevation of the bottom.

##### `getFillColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 0, 255]`

The rgba outline color of each polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the outline color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline color.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.

## Sub Layers

The PolygonLayer renders the following sublayers:

* `filled` - Renders the surface of all polygons with `GL.TRIANGLES` as `drawMode`. Only rendered if `filled:true`.
* `stroked` - Renders the outline of all polygons with `GL.LINES` as `drawMode`.

## Source

[modules/layers/src/column-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/column-layer)

