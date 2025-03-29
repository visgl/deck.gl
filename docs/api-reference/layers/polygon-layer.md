# PolygonLayer

import {PolygonLayerDemo} from '@site/src/doc-demos/layers';

<PolygonLayerDemo />

The `PolygonLayer` renders filled, stroked and/or extruded polygons.

PolygonLayer is a [CompositeLayer](../core/composite-layer.md) that wraps around the [SolidPolygonLayer](./solid-polygon-layer.md) and the [PathLayer](./path-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

const layer = new PolygonLayer({
  id: 'PolygonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

  getPolygon: d => d.contour,
  getElevation: d => d.population / d.area / 10,
  getFillColor: d => [d.population / d.area / 60, 140, 0],
  getLineColor: [255, 255, 255],
  getLineWidth: 20,
  lineWidthMinPixels: 1,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `${object.zipcode}\nPopulation: ${object.population}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

type ZipCode = {
  zipcode: number;
  population: number;
  area: number;
  contour: [longitude: number, latitude: number][];
};

const layer = new PolygonLayer<ZipCode>({
  id: 'PolygonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

  getPolygon: (d: ZipCode) => d.contour,
  getElevation: (d: ZipCode) => d.population / d.area / 10,
  getFillColor: (d: ZipCode) => [d.population / d.area / 60, 140, 0],
  getLineColor: [255, 255, 255],
  getLineWidth: 20,
  lineWidthMinPixels: 1,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<ZipCode>) => object && `${object.zipcode}\nPopulation: ${object.population}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type ZipCode = {
  zipcode: number;
  population: number;
  area: number;
  contour: [longitude: number, latitude: number][];
};

function App() {
  const layer = new PolygonLayer<ZipCode>({
    id: 'PolygonLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

    getPolygon: (d: ZipCode) => d.contour,
    getElevation: (d: ZipCode) => d.population / d.area / 10,
    getFillColor: (d: ZipCode) => [d.population / d.area / 60, 140, 0],
    getLineColor: [255, 255, 255],
    getLineWidth: 20,
    lineWidthMinPixels: 1,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<ZipCode>) => object && `${object.zipcode}\nPopulation: ${object.population}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {PolygonLayer} from '@deck.gl/layers';
import type {PolygonLayerProps} from '@deck.gl/layers';

new PolygonLayer<DataT>(...props: PolygonLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.PolygonLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

#### `filled` (boolean, optional) {#filled}

* Default: `true`

Whether to draw a filled polygon (solid fill). Note that only
the area between the outer polygon and any holes will be filled.

#### `stroked` (boolean, optional) {#stroked}

* Default: `true`

Whether to draw an outline around the polygon (solid fill). Note that
both the outer polygon as well the outlines of any holes will be drawn.

#### `extruded` (boolean, optional) {#extruded}

* Default: `false`

Whether to extrude the polygons (based on the elevations provided by the
`getElevation` accessor. If set to false, all polygons will be flat, this
generates less geometry and is faster than simply returning `0` from `getElevation`.

#### `wireframe` (boolean, optional) {#wireframe}

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Requires the `extruded` prop to be true.

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

#### `lineWidthUnits` (string, optional) {#linewidthunits}

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `lineWidthScale` (boolean, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthscale}

* Default: `1`

The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

#### `lineWidthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthminpixels}

* Default: `0`

The minimum line width in pixels.

#### `lineWidthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthmaxpixels}

* Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

#### `lineJointRounded` (boolean, optional) {#linejointrounded}

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

#### `lineMiterLimit` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linemiterlimit}

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

#### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.

#### `_normalize` (boolean, optional) {#_normalize}

* Default: `true`

> Note: This prop is experimental

If `false`, will skip normalizing the coordinates returned by `getPolygon`. Disabling normalization improves performance during data update, but makes the layer prone to error in case the data is malformed. It is only recommended when you use this layer with preprocessed static data or validation on the backend.

When normalization is disabled, polygons must be specified in the format of flat array or `{positions, holeIndices}`. Rings must be closed (i.e. the first and last vertices must be identical). The winding order of rings must be consistent with that defined by `_windingOrder`. See `getPolygon` below for details.

#### `_windingOrder` (string, optional) {#_windingorder}

* Default: `'CW'`

> Note: This prop is experimental

This prop is only effective with `_normalize: false`. It specifies the winding order of rings in the polygon data, one of:

- `'CW'`: outer-ring is clockwise, and holes are counter-clockwise
- `'CCW'`: outer-ring is counter-clockwise, and holes are clockwise

The proper value depends on the source of your data. Most geometry formats [enforce a specific winding order](https://gis.stackexchange.com/a/147971). Incorrectly set winding order will cause  an extruded polygon's surfaces to be flipped, affecting culling and the lighting effect.


### Data Accessors

#### `getPolygon` ([Accessor&lt;PolygonGeometry&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpolygon}

* default: `object => object.polygon`

Called on each object in the `data` stream to retrieve its corresponding polygon.

A polygon can be one of the following formats:

* An array of points (`[x, y, z]`) - a.k.a. a "ring".
* An array of rings. The first ring is the exterior boundary and the successive rings are the holes. Compatible with the GeoJSON [Polygon](https://tools.ietf.org/html/rfc7946#section-3.1.6) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of coordinates, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`, is equivalent to a single ring. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
* An object of shape `{positions, holeIndices}`.
  - `positions` (number[] | TypedArray) - a flat array of coordinates. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
  - `holeIndices` (number[]) - the starting index of each hole in the `positions` array. The first ring is the exterior boundary and the successive rings are the holes.

```ts
// All of the following are valid polygons
const polygons = [
  // Simple polygon (array of points)
  [[-122.4, 37.7, 0], [-122.4, 37.8, 5], [-122.5, 37.8, 10], [-122.5, 37.7, 5], [-122.4, 37.7, 0]],
  // Polygon with holes (array of rings)
  [
    [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
    [[-122.45, 37.73], [-122.47, 37.76], [-122.47, 37.71], [-122.45, 37.73]]
  ],
  // Flat simple polygon
  [-122.4, 37.7, 0, -122.4, 37.8, 5, -122.5, 37.8, 10, -122.5, 37.7, 5, -122.4, 37.7, 0],
  // Flat polygon with holes
  {
    positions: [-122.4, 37.7, 0, -122.4, 37.8, 0, -122.5, 37.8, 0, -122.5, 37.7, 0, -122.4, 37.7, 0, -122.45, 37.73, 0, -122.47, 37.76, 0, -122.47, 37.71, 0, -122.45, 37.73, 0],
    holeIndices: [15]
  }
]
```

If the optional third component `z` is supplied for a position, it specifies the altitude of the vertex:

<div>
  <img src="https://user-images.githubusercontent.com/18344164/48512983-cca32e80-e8ae-11e8-9107-c380925cf861.gif" />
  <p><i>Polygons with 3D positions, courtesy of <a href="https://github.com/SymbolixAU">@SymbolixAU</a> and <a href="https://github.com/mdsumner">@mdsumner</a></i></p>
</div>

#### `getFillColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getfillcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

#### `getLineColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinecolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the outline color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline color.


#### `getLineWidth` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinewidth}

* Default: `1`

The width of the outline of the polygon, in units specified by `lineWidthUnits` (default meters). Only applies if `extruded: false`.

* If a number is provided, it is used as the outline width for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline width.

#### `getElevation` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation to extrude each polygon with.
If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.
Only applies if `extruded: true`.

* If a number is provided, it is used as the elevation for all polygons.
* If a function is provided, it is called on each polygon to retrieve its elevation.

**Note:** If 3D positions are returned by `getPolygon`, the extrusion returned by `getElevation` is added to the base altitude of each vertex.


## Sub Layers

The PolygonLayer renders the following sublayers:

* `fill` - a [SolidPolygonLayer](./solid-polygon-layer.md) rendering the surface of all polygons.
* `stroke` - a [PathLayer](./path-layer.md) rendering the outline of all polygons. Only rendered if `stroked: true` and `extruded: false`.


## Remarks

* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.
* Wireframe lines are rendered with `GL.LINE` and thus will always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

## Source

[modules/layers/src/polygon-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/polygon-layer)
