
# FillStyleExtension

The `FillStyleExtension` adds selected features to layers that render a "fill", such as the `PolygonLayer` and `ScatterplotLayer`.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl FillStyleExtension" src="https://codepen.io/vis-gl/embed/eYBJWKz?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/eYBJWKz'>deck.gl FillStyleExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>

```js
import {GeoJsonLayer} from '@deck.gl/layers';
import {FillStyleExtension} from '@deck.gl/extensions';

const layer = new GeoJsonLayer({
  id: 'geojson-layer',
  data: GEOJSON,

  // props from GeoJsonLayer
  getFillColor: [255, 0, 0],
  getLineColor: [0, 0, 0],
  getLineWidth: 10,

  // props added by FillStyleExtension
  fillPatternAtlas: './pattern.png',
  fillPatternMapping: './pattern.json',
  getFillPattern: f => 'hatch',
  getFillPatternScale: 1,
  getFillPatternOffset: [0, 0],
  getFillPatternBackgroundColor: [200, 200, 200],

  // Define extensions
  extensions: [new FillStyleExtension({pattern: true})]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {FillStyleExtension} from '@deck.gl/extensions';
new FillStyleExtension({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```js
new deck.FillStyleExtension({});
```

## Constructor

```js
new FillStyleExtension({pattern, proceduralPattern});
```

* `pattern` (boolean) - if `true`, adds the ability to tile the filled area with a pattern.
* `proceduralPattern` (boolean) - if `true`, generates patterns in the fragment shader instead of
  sampling an image atlas. This also enables `pattern`; `fillPatternAtlas` is ignored.

### Procedural patterns

Set `proceduralPattern: true` and supply procedural definitions through `fillPatternMapping`:

```js
const PATTERNS = {
  hatch: {type: 'hatch'},
  doubleLines: {
    type: 'hatch',
    angle: 30,
    strokeWidth: 2,
    gap: [2, 8]
  },
  crossHatch: {
    type: 'cross-hatch',
    angles: [30, 120],
    strokeWidth: 2,
    gap: 6
  },
  dots: {
    type: 'dots',
    radius: 3,
    gap: 5,
    angle: 20,
    skew: 30
  }
};

const layer = new GeoJsonLayer({
  // ...
  fillPatternMapping: PATTERNS,
  fillPatternSizeUnits: 'pixels',
  getFillPattern: feature => feature.properties.pattern,
  getFillColor: [255, 255, 255],
  getFillPatternBackgroundColor: [0, 0, 0, 255],
  extensions: [new FillStyleExtension({proceduralPattern: true})]
});
```


## Layer Properties

When added to a layer via the `extensions` prop, the `FillStyleExtension` adds the following properties to the layer:

### Fill Pattern

The following properties are available if the `pattern` option is enabled.


#### `fillPatternAtlas` (Texture2D | String) {#fillpatternatlas}

Sprite image url or texture that packs all your patterns into one layout.
You can create sprite images with tools such as [TexturePacker](https://www.codeandweb.com/texturepacker).
Ignored when `proceduralPattern` is enabled.

#### `fillPatternEnabled` (boolean) {#fillpatternenabled}

- Default: `true`

Whether to use pattern fill. If `false`, then the extension has no effect.

#### `fillPatternMapping` (object | String) {#fillpatternmapping}

Pattern names mapped to pattern definitions.

For raster patterns, this may also be a URL to a JSON mapping. Each pattern is defined with the
following values:

- `x` (number, required): x position of pattern on the atlas image
- `y` (number, required): y position of pattern on the atlas image
- `width` (number, required): width of pattern on the atlas image
- `height` (number, required): height of pattern on the atlas image

For procedural patterns, this must be an object whose values are one of the following configurations.
All dimensions use [`fillPatternSizeUnits`](#fillpatternsizeunits) and are multiplied by
[`getFillPatternScale`](#getfillpatternscale).
The `HatchPatternConfig`, `CrossHatchPatternConfig`, `DotPatternConfig`,
`ProceduralPatternConfig`, and `ProceduralPatternMapping` TypeScript types are exported from
`@deck.gl/extensions`.

##### Hatch pattern

```ts
{
  type: 'hatch';
  angle?: number;
  strokeWidth?: number;
  gap?: number | [number, number];
}
```

* `angle` - direction of the lines in degrees. Default `0`.
* `strokeWidth` - width of each line; must be greater than `0`. Default `1`.
* `gap` - empty edge-to-edge distance between lines; values must be non-negative. A two-element
  array alternates the two gap values, which can be used to create groups of double lines.
  Default `1`.

##### Cross-hatch pattern

```ts
{
  type: 'cross-hatch';
  angles?: [number, number];
  strokeWidth?: number;
  gap?: number;
}
```

* `angles` - directions of the two intersecting sets of lines in degrees. Default `[45, 135]`.
* `strokeWidth` - width of each line; must be greater than `0`. Default `1`.
* `gap` - empty edge-to-edge distance between adjacent lines; must be non-negative. Default `1`.

##### Dot pattern

```ts
{
  type: 'dots';
  radius?: number;
  gap?: number;
  angle?: number;
  skew?: number;
}
```

* `radius` - radius of each dot; must be greater than `0`. Default `1`.
* `gap` - empty edge-to-edge distance between dots along both grid axes; must be non-negative.
  Default `1`.
* `angle` - rotation of the dot grid in degrees. Default `0`.
* `skew` - degrees that the second grid axis tilts toward the first. `0` produces an orthogonal
  grid. Must be greater than `-90` and less than `90`. Default `0`.


#### `fillPatternMask` (boolean) {#fillpatternmask}

- Default: `true`
 
Whether to treat the patterns as transparency masks.
+ If `true`, user defined color (e.g. from `getFillColor`) is applied.
+ If `false`, pixel color from the image is applied.

Procedural patterns always generate alpha and use the layer's fill color, so this option only
affects raster patterns.

In both cases the pattern is composited over
[`getFillPatternBackgroundColor`](#getfillpatternbackgroundcolor), so the layer's fill color styles
the pattern and the background color styles the area behind it.


#### `fillPatternSizeUnits` (string, optional) {#fillpatternsizeunits}

- Default: `'meters'`

The units of the pattern size, one of `'meters'`, `'common'` and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units). A 24 x 24 pixel pattern at [`getFillPatternScale: 1`](#getfillpatternscale) covers 24 units of the chosen unit. Procedural pattern stroke widths, gaps, and radii use the same units.

+ `'meters'` anchors the pattern to the ground, so it zooms along with the rest of the map.
+ `'common'` sizes the pattern in [common space](../../developer-guide/coordinate-systems.md) units, which is what a non-geospatial view (`COORDINATE_SYSTEM.CARTESIAN`) wants - meters are converted with a fixed Web Mercator ratio and are not meaningful there.
+ `'pixels'` keeps the pattern at a constant size on screen instead. The size is re-anchored at each integer zoom level rather than followed continuously, so that the tiling stays put while zooming within a level; the pattern therefore stays within a factor of `sqrt(2)` of its nominal pixel size.

```js
new GeoJsonLayer({
  // ...
  // A 24 x 24 pattern drawn at 24 x 24 screen pixels, at any zoom
  fillPatternSizeUnits: 'pixels',
  getFillPatternScale: 1,
  extensions: [new FillStyleExtension({pattern: true})]
});
```

#### `getFillPattern` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpattern}

Called to retrieve the name of the pattern. Returns a string key from the `fillPatternMapping` object.


#### `getFillPatternScale` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpatternscale}

- Default: `1`

The scale of the pattern relative to its dimensions in
[`fillPatternSizeUnits`](#fillpatternsizeunits). This scales raster frame dimensions and every
procedural pattern dimension uniformly.

- If a number is provided, it is used as the pattern scale for all objects.
- If a function is provided, it is called on each object to retrieve its pattern scale.


#### `getFillPatternOffset` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpatternoffset}

- Default: `[0, 0]`

The offset of the pattern, relative to the original size. Offset `[0.5, 0.5]` shifts the pattern alignment by half.

- If an array is provided, it is used as the pattern offset for all objects.
- If a function is provided, it is called on each object to retrieve its pattern offset.


#### `getFillPatternBackgroundColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpatternbackgroundcolor}

- Default: `[0, 0, 0, 0]`

The color filled behind the pattern. The pattern is composited on top of it, so the background shows
through wherever the pattern is transparent. Defaults to fully transparent, which leaves the area
behind the pattern unfilled.

This makes it possible to style a polygon's background independently from the pattern drawn over it
within a single layer. The layer's own `getFillColor` (or, with
[`fillPatternMask: false`](#fillpatternmask), the atlas image) colors the pattern, while
`getFillPatternBackgroundColor` colors the fill underneath:

```js
new GeoJsonLayer({
  // ...
  // A white pattern over a data-driven background
  getFillColor: [255, 255, 255],
  getFillPatternBackgroundColor: f => COLOR_SCALE(f.properties.value),
  extensions: [new FillStyleExtension({pattern: true})]
});
```

## Source

[modules/extensions/src/fill-style](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/fill-style)
