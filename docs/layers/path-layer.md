<!-- INJECT:"PathLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# PathLayer

The Path Layer takes in lists of coordinate points and renders them as extruded lines with mitering.

```js
import DeckGL, {PathLayer} from 'deck.gl';

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
    onHover: ({object}) => setTooltip(object.name)
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `widthScale` (Number, optional)

* Default: `1`

The path width multiplier that multiplied to all paths.

##### `widthMinPixels` (Number, optional)

* Default: `0`

The minimum path width in pixels.

##### `widthMaxPixels` (Number, optional)

* Default: Number.MAX_SAFE_INTEGER

The maximum path width in pixels.

##### `rounded` (Boolean, optional)

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `miterLimit` (Number, optional)

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `rounded` is `false`.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `dashJustified` (Boolean, optional)

* Default: `false`

Only effective if `getDashArray` is specified. If `true`, adjust gaps for the dashes to align at both ends.

### Data Accessors

##### `getPath` (Function, optional)

* Default: `(object, index) => object.paths`

Returns the specified path for the object.

A path is an array of coordinates.

##### `getColor` (Function, optional)

Returns an array of color

* Default `(object, index) => object.color || [0, 0, 0, 255]`

Method called to determine the rgba color of the source.

If the color alpha (the fourth component) is not provided,
`alpha` will be set to `255`.

##### `getWidth` (Function, optional)

* Default: `(object, index) => object.width || 1`

Method called to determine the width to draw each path with.
Unit is meters.

##### `getDashArray` (Function, optional)

* Default: `null`

Method called to get the dash array to draw each path with.
Returns an array of two numbers: `[dashSize, gapSize]` relative to the width of the path. Returns `[0, 0]` to draw the path in solid line.

If this accessor is not specified, all paths are drawn as solid lines.

## Source

[modules/core/src/core-layers/path-layer](https://github.com/uber/deck.gl/tree/5.2-release/modules/core/src/core-layers/path-layer)
