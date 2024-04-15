# SolidPolygonLayer

import {SolidPolygonLayerDemo} from '@site/src/doc-demos/layers';

<SolidPolygonLayerDemo />

The `SolidPolygonLayer` renders filled and/or extruded polygons. This is the primitive layer rendered by [PolygonLayer](./polygon-layer.md) as the "fill" part of the polygons.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';

const layer = new SolidPolygonLayer({
  id: 'SolidPolygonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

  extruded: true,
  wireframe: true,
  getPolygon: d => d.contour,
  getElevation: d => d.population / d.area / 10,
  getFillColor: d => [d.population / d.area / 60, 140, 0],
  getLineColor: [80, 80, 80],
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
import {SolidPolygonLayer} from '@deck.gl/layers';

type ZipCode = {
  zipcode: number;
  population: number;
  area: number;
  contour: [longitude: number, latitude: number][];
};

const layer = new SolidPolygonLayer<ZipCode>({
  id: 'SolidPolygonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

  extruded: true,
  wireframe: true,
  getPolygon: (d: ZipCode) => d.contour,
  getElevation: (d: ZipCode) => d.population / d.area / 10,
  getFillColor: (d: ZipCode) => [d.population / d.area / 60, 140, 0],
  getLineColor: [80, 80, 80],
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
import DeckGL from '@deck.gl/react';
import {SolidPolygonLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type ZipCode = {
  zipcode: number;
  population: number;
  area: number;
  contour: [longitude: number, latitude: number][];
};

function App() {
  const layer = new SolidPolygonLayer<ZipCode>({
    id: 'SolidPolygonLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json',

    extruded: true,
    wireframe: true,
    getPolygon: (d: ZipCode) => d.contour,
    getElevation: (d: ZipCode) => d.population / d.area / 10,
    getFillColor: (d: ZipCode) => [d.population / d.area / 60, 140, 0],
    getLineColor: [80, 80, 80],
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
import {SolidPolygonLayer} from '@deck.gl/layers';
import type {SolidPolygonLayerProps} from '@deck.gl/layers';

new SolidPolygonLayer<DataT>(...props: SolidPolygonLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.SolidPolygonLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

#### `filled` (boolean, optional) {#filled}

* Default: `true`

Whether to fill the polygons (based on the color provided by the
`getFillColor` accessor.

#### `extruded` (boolean, optional) {#extruded}

* Default: `false`

Whether to extrude the polygons (based on the elevations provided by the
`getElevation` accessor. If set to false, all polygons will be flat, this
generates less geometry and is faster than simply returning `0` from `getElevation`.

#### `wireframe` (boolean, optional) {#wireframe}

* Default: `false`

Whether to generate a line wireframe of the polygon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

**Remarks:**

* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

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

The proper value depends on the source of your data. Most geometry formats [enforce a specific winding order](https://gis.stackexchange.com/a/147971). Incorrectly set winding order will cause an extruded polygon's surfaces to be flipped, affecting culling and the lighting effect.

#### `_full3d` (boolean, optional) {#_full3d}

* Default: `false`

> Note: This prop is experimental

When true, polygon tesselation will be performed on the plane with the largest area, instead of the xy plane.

Remarks:

* Only use this if you experience issues rendering features that only change on the z axis.
* This prop is only effective with `XYZ` data.

### Data Accessors

#### `getPolygon` ([Accessor&lt;PolygonGeometry&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpolygon}

* Default: `object => object.polygon`

This accessor returns the polygon corresponding to an object in the `data` stream.

A polygon can be one of the following formats:

* An array of points (`[x, y, z]`) - a.k.a. a "ring".
* An array of rings. The first ring is the exterior boundary and the following rings are the holes. Compatible with the GeoJSON [Polygon](https://tools.ietf.org/html/rfc7946#section-3.1.6) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of numbers, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`, is equivalent to a single ring. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
* An object of shape `{positions, holeIndices}`.
  - `positions` (number[] | TypedArray) - a flat array of coordinates. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
  - `holeIndices` (number[]) - the starting index of each hole in the `positions` array. The first ring is the exterior boundary and the successive rings are the holes.


#### `getFillColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getfillcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

#### `getLineColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinecolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.
Only applies if `extruded: true`.

* If an array is provided, it is used as the stroke color for all polygons.
* If a function is provided, it is called on each object to retrieve its stroke color.

#### `getElevation` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation to extrude each polygon with.
If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.
Only applies if `extruded: true`.

* If a number is provided, it is used as the elevation for all polygons.
* If a function is provided, it is called on each object to retrieve its elevation.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](../../developer-guide/performance.md#supply-attributes-directly) to a `SolidPolygonLayer`.

Because each polygon has a different number of vertices, when `data.attributes.getPolygon` is supplied, the layer also requires an array `data.startIndices` that describes the vertex index at the start of each polygon. For example, if there are 3 polygons of 3, 4, and 5 vertices each (including the end vertex that overlaps with the first vertex to close the loop), `startIndices` should be `[0, 3, 7, 12]`. *Polygons with holes are not supported when using precalculated attributes.*

Additionally, all other attributes (`getFillColor`, `getElevation`, etc.), if supplied, must contain the same layout (number of vertices) as the `getPolygon` buffer.

To truly realize the performance gain from using binary data, the app likely wants to skip all data processing in this layer. Specify the `_normalize` prop to skip normalization.

Example use case:

```ts title="Use plain JSON array"
const POLYGON_DATA = [
  {
     contour: [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
     population: 26599
  },
  ...
];

new SolidPolygonLayer({
  data: POLYGON_DATA,
  getPolygon: d => d.contour,
  getElevation: d => d.population,
  getFillColor: [0, 100, 60, 160]
})
```

The equivalent binary attributes would be:

```ts title="Use binary attributes"
// Flatten the polygon vertices
// [-122.4, 37.7, -122.4, 37.8, -122.5, 37.8, -122.5, 37.7, -122.4, 37.7, ...]
const positions = new Float64Array(POLYGON_DATA.map(d => d.contour).flat(2));
// The color attribute must supply one color for each vertex
// [255, 0, 0, 255, 0, 0, 255, 0, 0, ...]
const elevations = new Uint8Array(POLYGON_DATA.map(d => d.contour.map(_ => d.population)).flat());
// The "layout" that tells PathLayer where each path starts
const startIndices = new Uint16Array(POLYGON_DATA.reduce((acc, d) => {
  const lastIndex = acc[acc.length - 1];
  acc.push(lastIndex + d.contour.length);
  return acc;
}, [0]));

new SolidPolygonLayer({
  data: {
    length: POLYGON_DATA.length,
    startIndices: startIndices, // this is required to render the paths correctly!
    attributes: {
      getPolygon: {value: positions, size: 2},
      getElevation: {value: elevations, size: 1}
    }
  },
  _normalize: false, // this instructs the layer to skip normalization and use the binary as-is
  getFillColor: [0, 100, 60, 160]
})
```


## Remarks

* This layer only renders filled polygons. If you need to render polygon
  outlines, use the [`PathLayer`](./path-layer.md)
* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.

## Source

[modules/layers/src/solid-polygon-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/solid-polygon-layer)
