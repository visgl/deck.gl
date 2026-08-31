
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
new FillStyleExtension({pattern});
```

* `pattern` (boolean) - if `true`, adds the ability to tile the filled area with a pattern.


## Layer Properties

When added to a layer via the `extensions` prop, the `FillStyleExtension` adds the following properties to the layer:

### Fill Pattern

The following properties are available if the `pattern` option is enabled.


#### `fillPatternAtlas` (Texture2D | String) {#fillpatternatlas}

Sprite image url or texture that packs all your patterns into one layout.
You can create sprite images with tools such as [TexturePacker](https://www.codeandweb.com/texturepacker).

#### `fillPatternEnabled` (boolean) {#fillpatternenabled}

- Default: `true`

Whether to use pattern fill. If `false`, then the extension has no effect.

#### `fillPatternMapping` (object | String) {#fillpatternmapping}

Pattern names mapped to pattern definitions. Each pattern is defined with the following values:

- `x` (number, required): x position of pattern on the atlas image
- `y` (number, required): y position of pattern on the atlas image
- `width` (number, required): width of pattern on the atlas image
- `height` (number, required): height of pattern on the atlas image


#### `fillPatternMask` (boolean) {#fillpatternmask}

- Default: `true`
 
Whether to treat the patterns as transparency masks.
+ If `true`, user defined color (e.g. from `getFillColor`) is applied.
+ If `false`, pixel color from the image is applied.

In both cases the pattern is composited over
[`getFillPatternBackgroundColor`](#getfillpatternbackgroundcolor), so the layer's fill color styles
the pattern and the background color styles the area behind it.


#### `getFillPattern` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpattern}

Called to retrieve the name of the pattern. Returns a string key from the `fillPatternMapping` object.


#### `getFillPatternScale` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors)) {#getfillpatternscale}

- Default: `1`

The scale of the pattern, relative to the original size. If the pattern is 24 x 24 pixels, scale `1` roughly yields 24 meters.

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
