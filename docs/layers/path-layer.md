<!-- INJECT:"PathLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
</p>

# PathLayer

The Path Layer takes in lists of coordinate points and renders them as extruded lines with mitering.

```js
import DeckGL from '@deck.gl/react';
import {PathLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     path: [[-122.4, 37.7], [-122.5, 37.8], [-122.6, 37.85]],
   *     name: 'Richmond - Millbrae',
   *     color: [255, 0, 0]
   *   },
   *   ...
   * ]
   */
  const layer = new PathLayer({
    id: 'path-layer',
    data,
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => colorToRGBArray(d.color),
    getWidth: d => 5,
    onHover: ({object, x, y}) => {
      const tooltip = object.name;
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
import {PathLayer} from '@deck.gl/layers';
new PathLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.PathLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `widthUnits` (String, optional)

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `widthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The path width multiplier that multiplied to all paths.

##### `widthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum path width in pixels. This prop can be used to prevent the path from getting too thin when zoomed out.

##### `widthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: Number.MAX_SAFE_INTEGER

The maximum path width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.

##### `rounded` (Boolean, optional)

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `billboard` (Boolean, optional)

* Default: `false`

If `true`, extrude the path in screen space (width always faces the camera).
If `false`, the width always faces up.

##### `miterLimit` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `rounded` is `false`.

##### `dashJustified` (Boolean, optional)

* Default: `false`

Only effective if `getDashArray` is specified. If `true`, adjust gaps for the dashes to align at both ends.

### Data Accessors

##### `getPath` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.path`

Called on each object in the `data` stream to retrieve its corresponding path.

A path can be one of the following formats:

* An array of points (`[x, y, z]`). Compatible with the GeoJSON [LineString](https://tools.ietf.org/html/rfc7946#section-3.1.4) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of numbers, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`:

```js
new PathLayer({
  ...
  getPath: object => object.vertices, // [x0, y0, x1, y1, x2, y2, ...]
  positionFormat: `XY`
})
```

##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default `[0, 0, 0, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of each path, in units specified by `widthUnits` (default meters).

* If a number is provided, it is used as the width for all paths.
* If a function is provided, it is called on each path to retrieve its width.

##### `getDashArray` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

* Default: `null`

The dash array to draw each path with: `[dashSize, gapSize]` relative to the width of the path.

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.

## Source

[modules/layers/src/path-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/path-layer)
