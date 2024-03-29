# GeoJsonLayer

import {GeoJsonLayerDemo} from '@site/src/doc-demos/layers';

<GeoJsonLayerDemo />

The `GeoJsonLayer` renders [GeoJSON](http://geojson.org) formatted data as polygons, lines and points (circles, icons and/or texts).

`GeoJsonLayer` is a [CompositeLayer](../core/composite-layer.md). See the [sub layers](#sub-layers) that it renders.

```js
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  /**
   * Data format:
   * Valid GeoJSON object
   */
  const layer = new GeoJsonLayer({
    id: 'geojson-layer',
    data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    pointType: 'circle',
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: [160, 160, 180, 200],
    getLineColor: d => colorToRGBArray(d.properties.color),
    getPointRadius: 100,
    getLineWidth: 1,
    getElevation: 30
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && (object.properties.name || object.properties.station)} />;
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
import {GeoJsonLayer} from '@deck.gl/layers';
new GeoJsonLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.GeoJsonLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

##### `data` {#data}

The `GeoJSONLayer` accepts any of the following formats passed to the `data` prop:

* A valid GeoJSON `FeatureCollection`, `Feature`, `Geometry` or `GeometryCollection` object.
* An array of GeoJSON `Feature` objects.
* An URL or Promise that resolves to the above formats.
* loaders.gl's [flat GeoJSON format](https://loaders.gl/modules/gis/docs/api-reference/geojson-to-binary).

##### `pointType` (String, optional) {#pointtype}

* Default: `'circle'`

How to render `Point` and `MultiPoint` features in the data. Supported types are:

- `circle`
- `icon`
- `text`

To use more than one type, join the names with `+`, for example `pointType: 'icon+text'`.

### Fill Options

The following props control the solid fill of `Polygon` and `MultiPolygon`
features, and the `Point` and `MultiPoint` features if `pointType` is `'circle'`.

##### `filled` (Boolean, optional) {#filled}

* Default: `true`

Whether to draw filled polygons (solid fill) and points (circles). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.


##### `getFillColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getfillcolor}

* Default: `[0, 0, 0, 255]`

The solid color of the polygon and points (circles).
Format is `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the fill color for all features.
* If a function is provided, it is called on each feature to retrieve its fill color.


### Stroke Options

The following props control the `LineString` and `MultiLineString` features,
the outline for `Polygon` and `MultiPolygon` features, and the outline for `Point` and `MultiPoint` features if `pointType` is `'circle'`.


##### `stroked` (Boolean, optional) {#stroked}

* Default: `true`

Whether to draw an outline around polygons and points (circles). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.


##### `getLineColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinecolor}

* Default: `[0, 0, 0, 255]`

The rgba color of a line is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the line color for all features.
* If a function is provided, it is called on each feature to retrieve its line color.


##### `getLineWidth` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinewidth}

* Default: `1`

The width of a line, in units specified by `lineWidthUnits` (default meters).

* If a number is provided, it is used as the line width for all features.
* If a function is provided, it is called on each feature to retrieve its line width.


##### `lineWidthUnits` (String, optional) {#linewidthunits}

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

##### `lineWidthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthscale}

* Default: `1`

A multiplier that is applied to all line widths.

##### `lineWidthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthminpixels}

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.

##### `lineWidthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthmaxpixels}

* Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels. This prop can be used to prevent the line from getting too thick when zoomed in.

##### `lineCapRounded` (Boolean, optional) {#linecaprounded}

* Default: `false`

Type of line caps. If `true`, draw round caps. Otherwise draw square caps.

##### `lineJointRounded` (Boolean, optional) {#linejointrounded}

* Default: `false`

Type of line joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linemiterlimit}

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `lineBillboard` (Boolean, optional) {#linebillboard}

* Default: `false`

If `true`, extrude the line in screen space (width always faces the camera).
If `false`, the width always faces up.

### 3D Options

The following props control the extrusion of `Polygon` and `MultiPolygon` features.

##### `extruded` (Boolean, optional) {#extruded}

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

* Default: `false`

##### `wireframe` (Boolean, optional) {#wireframe}

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:

* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
* This is only effective if the `extruded` prop is set to true.


##### `getElevation` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

* If a number is provided, it is used as the elevation for all polygon features.
* If a function is provided, it is called on each polygon feature to retrieve its elevation.


##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all polygon elevation without updating the data.


##### `material` (Object, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


##### `_full3d` (Boolean, optional) {#_full3d}

* Default: `false`

> Note: This prop is experimental

When true, polygon tesselation will be performed on the plane with the largest area, instead of the xy plane.

Remarks:

* Only use this if you experience issues rendering features that only change on the z axis.
* This prop is only effective with `XYZ` data.


### pointType:circle Options

The following props are forwarded to a `ScatterplotLayer` if `pointType` is `'circle'`.

| Prop name | Default value | ScatterplotLayer equivalent |
| --------- | ------------- | --------------------------- |
| `getPointRadius` | `1` | [getRadius](./scatterplot-layer.md#getradius) |
| `pointRadiusUnits` | `'meters'` | [radiusUnits](./scatterplot-layer.md#radiusunits) |
| `pointRadiusScale` | `1` | [radiusScale](./scatterplot-layer.md#radiusscale) |
| `pointRadiusMinPixels` | `0` | [radiusMinPixels](./scatterplot-layer.md#radiusminpixels) |
| `pointRadiusMaxPixels` | `Number.MAX_SAFE_INTEGER` | [radiusMaxPixels](./scatterplot-layer.md#radiusmaxpixels) |
| `pointAntialiasing` | `true` | [antialiasing](./scatterplot-layer.md#antialiasing) |
| `pointBillboard` | `false` | [billboard](./scatterplot-layer.md#billboard) |

### pointType:icon Options

The following props are forwarded to an `IconLayer` if `pointType` is `'icon'`.

| Prop name | Default value | IconLayer equivalent |
| --------- | ------------- | --------------------------- |
| `iconAtlas` | `null` | [iconAtlas](./icon-layer.md#iconatlas) |
| `iconMapping` | `{}` | [iconMapping](./icon-layer.md#iconmapping) |
| `getIcon` | `f => f.properties.icon` | [getIcon](./icon-layer.md#geticon) |
| `getIconSize` | `1` | [getSize](./icon-layer.md#getsize) |
| `getIconColor` | `[0, 0, 0, 255]` | [getColor](./icon-layer.md#getcolor) |
| `getIconAngle` | `0` | [getAngle](./icon-layer.md#getangle) |
| `getIconPixelOffset` | `[0, 0]` | [getPixelOffset](./icon-layer.md#getpixeloffset) |
| `iconSizeUnits` | `'pixels'` | [sizeUnits](./icon-layer.md#sizeunits) |
| `iconSizeScale` | `1` | [sizeScale](./icon-layer.md#sizescale) |
| `iconSizeMinPixels` | `0` | [sizeMinPixels](./icon-layer.md#sizeminpixels) |
| `iconSizeMaxPixels` | `Number.MAX_SAFE_INTEGER` | [sizeMaxPixels](./icon-layer.md#sizemaxpixels) |
| `iconBillboard` | `true` | [billboard](./icon-layer.md#billboard) |
| `iconAlphaCutoff` | `0.05` | [alphaCutoff](./icon-layer.md#alphaCutoff) |

### pointType:text Options

The following props are forwarded to a `TextLayer` if `pointType` is `'text'`.

| Prop name | Default value | TextLayer equivalent |
| --------- | ------------- | --------------------------- |
| `getText` | `f => f.properties.text` | [getText](./text-layer.md#gettext) |
| `getTextColor` | `[0, 0, 0, 255]` | [getColor](./text-layer.md#getcolor) |
| `getTextAngle` | `0` | [getAngle](./text-layer.md#getangle) |
| `getTextSize` | `32` | [getSize](./text-layer.md#getsize) |
| `getTextAnchor` | `'middle'` | [getTextAnchor](./text-layer.md#gettextanchor) |
| `getTextAlignmentBaseline` | `'center'` | [getAlignmentBaseline](./text-layer.md#getalignmentbaseline) |
| `getTextPixelOffset` | `[0, 0]` | [getPixelOffset](./text-layer.md#getpixeloffset) |
| `getTextBackgroundColor` | `[255, 255, 255, 255]` | [getBackgroundColor](./text-layer.md#getbackgroundcolor) |
| `getTextBorderColor` | `[0, 0, 0, 255]` | [getBorderColor](./text-layer.md#getbordercolor) |
| `getTextBorderWidth` | `0` | [getBorderWidth](./text-layer.md#getborderwidth) |
| `textSizeUnits` | `'pixels'` | [sizeUnits](./text-layer.md#sizeunits) |
| `textSizeScale` | `1` | [sizeScale](./text-layer.md#sizescale) |
| `textSizeMinPixels` | `0` | [sizeMinPixels](./text-layer.md#sizeminpixels) |
| `textSizeMaxPixels` | `Number.MAX_SAFE_INTEGER` | [sizeMaxPixels](./text-layer.md#sizemaxpixels) |
| `textCharacterSet` | ASCII chars 32-128 | [characterSet](./text-layer.md#characterset) |
| `textFontFamily` | `'Monaco, monospace'` | [fontFamily](./text-layer.md#fontfamily) |
| `textFontWeight` | `'normal'` | [fontWeight](./text-layer.md#fontweight) |
| `textLineHeight` | `1` | [lineHeight](./text-layer.md#lineheight) |
| `textMaxWidth` | `-1` | [maxWidth](./text-layer.md#maxwidth) |
| `textWordBreak` | `'break-word'` | [wordBreak](./text-layer.md#wordbreak) |
| `textBackground` | `false` | [background](./text-layer.md#background) |
| `textBackgroundPadding` | `[0, 0]` | [backgroundPadding](./text-layer.md#backgroundpadding) |
| `textOutlineColor` | `[0, 0, 0, 255]` | [outlineColor](./text-layer.md#outlinecolor) |
| `textOutlineWidth` | `0` | [outlineWidth](./text-layer.md#outlinewidth) |
| `textBillboard` | `true` | [billboard](./text-layer.md#billboard) |
| `textFontSettings` | `{}` | [fontSettings](./text-layer.md#fontSettings) |

## Sub Layers

The GeoJsonLayer renders the following sublayers:

* `polygons-fill` - a [SolidPolygonLayer](./solid-polygon-layer.md) rendering all the `Polygon` and `MultiPolygon` features.
* `polygons-stroke` - a [PathLayer](./path-layer.md) rendering the outline of all the `Polygon` and `MultiPolygon` features. Only rendered if `stroked: true` and `extruded: false`.
* `linestrings` - a [PathLayer](./path-layer.md) rendering all the `LineString` and `MultiLineString` features.
* `points-circle` - a [ScatterplotLayer](./scatterplot-layer.md) rendering all the `Point` and `MultiPoint` features if `pointType` is `'circle'`.
* `points-icon` - an [IconLayer](./icon-layer.md) rendering all the `Point` and `MultiPoint` features if `pointType` is `'icon'`.
* `points-text` - a [TextLayer](./text-layer.md) rendering all the `Point` and `MultiPoint` features if `pointType` is `'text'`.

## Using binary data

This section is about the special requirements when [supplying attributes directly](../../developer-guide/performance.md#supply-attributes-directly) to a `GeoJsonLayer`.

The most common way to supply binary data is to use the [flat GeoJSON format](https://loaders.gl/modules/gis/docs/api-reference/geojson-to-binary), this is done by default when using the [MVTLayer](../geo-layers/mvt-layer.md). 

### Binary format details

In general this format is not intended to be human readable, and rather than being edited by hand should be generated with [geojsonToBinary](https://loaders.gl/modules/gis/docs/api-reference/geojson-to-binary). The purpose of this section is to help explain how this format works.

At the top level the data is grouped by geometry type, into points, lines and polygons:

```js
const data = {points: {...}, lines: {...}, polygons: {...}};
```

When the `GeoJsonLayer` detects this data structure it assumes it is dealing with binary data, rather than standard GeoJSON. Within each geometry type the data is laid out in a format that corresponds to the buffers that will be sent to the GPU. 

#### Points

For example, for the point data, the positions are encoded as a flat interleaved array with associated properties grouped by point:

```js
points: {
  positions: {value: Float32Array([x0, y0, x1, y1, ...]), size: 2}, // Use size: 3 for xyz
  properties: [{name: 'name0', address: 'address0'}, {name: 'name1', ...}, ...],
  ...
}
```

#### Numeric properties

For performance numeric properties can be passed as flat arrays:

```js
points: {
  ...,
  numericProps: {
    numericProperty1: {value: Float32Array([v0, v1, ...], size: 1}
    numericProperty2: {value: Float32Array([v0, v1, ...], size: 1}
  }
```

#### Feature ids

In order to specify how the `positions` data should be interpreted an array of feature ids is included. Often in the case of points this is just a trivial incrementing list:

```js
points: {
  featureIds: {value: Uint16Array([0, 1, 2, ...]), size: 1}
}

```

These ids correspond to the values in the `positions` array and always start from 0, and increase, without any skipping any values.

These are in general not equal to the `id`s present as top level fields on the GeoJSON source. Those are instead stored in the `fields` property in the same format as the `properties`. 

#### Representing MultiPoints

A MultiPoint is a feature which represents one logical unit, but compromises of a collection of point geometries. This is represented by association, where points within a MultiPoint will share the same `featureId`. Here `(x0, y0)` are a simple Point, while `(x1, y1)` and `(x2, y2)` belong to a MultiPoint.

points: {
  positions: {value: Float32Array([x0, y0, x1, y1, x2, y2]), size: 2},
  featureIds: {value: Uint16Array([0, 1, 1, ...]), size: 1}
}

#### Array lengths

Due to MultiPoints, the length of `properties` and `fields` arrays will not always be the same length (multiplied by `positions.size`) as the `positions` array. The length will match the count of individual features. This is in contrast to the `featureId` and `numericProp` arrays, which will contain the same number of elements as the `positions` array (divided by `positions.size`).


#### Example comparison

```js
geojson = {
  type: 'FeatureCollection',
  features: [{
    id: 123,
    type: 'Feature',
    properties: {name: 'London', population: 10000000},
    geometry: {coordinates: [1.23, 4.56], type: 'Point'}
  },
  ...
  ]
}

binary = {
  points: {
    positions: {value: Float32Array([1,23, 4.56, ...]), size: 2},
    properties: [{name: 'London'}, ...],
    numericProps: {
      population: {value: Float32Array([10000000, ...], size: 1}
    }
    featureIds: {value: Uint16Array([0, ...]), size: 1}
    fields: [{id: 123}]
  }
}
```

#### Lines

Lines are represented in a similar manner, with the addition of a `pathIndices` array, which contains a series of offsets into the `positions` array, specifying where each line begins. All the other parameters are as above, namely that `featureIds` and `numericProps` are stored per-vertex, while `properties` and `fields` are per-feature.

Here is how lines are represented, the first four vertices belong to the first line, thus the value of the second path index is 4.

```js
lines: {
  positions: {value: Float32Array([x0, y0, ..., x4, y4, ...]), size: 2},
  properties: [{name: 'name0'}, {name: 'name1}, ...],
  numericProps: {
    population: {value: Float32Array([100, 100, 100, 100, 789, 789, ...], size: 1}
  }
  pathIndices: {value: Uint16Array([0, 4, ...]), size: 1}
  featureIds: {value: Uint16Array([0, 0, 0, 0, 1, 1, ...]), size: 1}
  fields: [{id: 123}, {id: 456}]
}
```

#### Polygons

Polygons are an extension of the idea introduced with lines, but instead of `pathIndices` the `polygonIndicies` array specifies where each polygon starts inside the `positions` array. Because polygons can have holes, the offsets for the outer and inner rings are stored separately in the `primitivePolygonIndices` array. A polygon that has an outer ring consisting of 60 vertices and a hole with 40 vertices is represented as:

```js
polygons: {
  positions: {value: Float32Array([x0, y0, ...]), size: 2},
  polygonIndices: {value: Uint16Array([0, 100, ...]), size: 1}
  primitivePolygonIndices: {value: Uint16Array([0, 60, 100, ...]), size: 1}
}
```

Note the subtle difference here to other columnar formats (like [GeoArrow](https://github.com/geoarrow/geoarrow/)) where the indices are nested, i.e. `polygonIndices` point into the `primitivePolygonIndices` array rather than directly into `positions`.

#### Global feature ids

Because the `features` array in the GeoJSON can contain a mix of different geometry types, in order to represent this ordering each of the `points`, `lines` and `polygons` objects contains a `globalFeatureIds` array, which contains the per-vertex indices into the original GeoJSON `features' array.


### Overriding attibutes

In order to pass [pass attributes directly](../../developer-guide/performance.md#supply-attributes-directly) directly to the sublayers, an optional `attributes` member can be added to the `points`, `lines` or `polygons`. For example to pass the `getWidth` attribute to the `PathLayer`:

```js
lines: {
  ...,
  attributes: {
    getWidth: {value: new Float32Array([1, 2, 3, ....]), size: 1}
  }
}

```


## Remarks

* Geometry transition can be enabled with `props.transitions: {geometry: <transition_settings>}`.
* Input data must adhere to the [GeoJSON specification](https://tools.ietf.org/html/rfc7946). Most GIS software support exporting to GeoJSON format. You may validate your data with free tools such as [this](https://geojson.io/).
* The GeoJsonLayer renders 3D geometries if each feature's `coordinates` contain 3D points.


## Source

[modules/layers/src/geojson-layer](https://github.com/visgl/deck.gl/tree/9.0-release/modules/layers/src/geojson-layer)
