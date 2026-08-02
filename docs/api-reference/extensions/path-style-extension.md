
# PathStyleExtension

The `PathStyleExtension` adds selected features to the [PathLayer](../layers/path-layer.md) and composite layers that render the `PathLayer`, e.g. [PolygonLayer](../layers/polygon-layer.md) and [GeoJsonLayer](../layers/geojson-layer.md).

It also supports dashed strokes on [ScatterplotLayer](../layers/scatterplot-layer.md) and [TextLayer](../layers/text-layer.md) backgrounds (via the `dash` option).

> Note: In v8.0, the `getDashArray` and `dashJustified` props are removed from the `PathLayer` and moved into this extension.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl PathStyleExtension" src="https://codepen.io/vis-gl/embed/dyOMaoX?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/dyOMaoX'>deck.gl PathStyleExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>

```js
import {PolygonLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

const layer = new PolygonLayer({
  id: 'polygon-layer',
  data,
  ...
  getDashArray: [3, 2],
  dashJustified: true,
  dashGapPickable: true,
  extensions: [new PathStyleExtension({dash: true})]
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
import {PathStyleExtension} from '@deck.gl/extensions';
new PathStyleExtension({});
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
new deck.PathStyleExtension({});
```

## Constructor

```js
new PathStyleExtension({dash});
```

* `dash` (boolean) - add capability to render dashed lines. Default `false`.
* `dashMode` (string) - how the dash pattern is positioned along a path, one of `'segment'` and `'path'`. See "Remarks" below. Default `'segment'`.
* `offset` (boolean) - add capability to offset lines. Default `false`.
* `highPrecisionDash` (boolean) - **deprecated**, an alias for `dashMode: 'path'`. Default `false`.

## Layer Properties

When added to a layer via the `extensions` prop, the `PathStyleExtension` adds the following properties to the layer:


#### `getDashArray` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors)) {#getdasharray}

Must be specified if the `dash` option is enabled.

The dash array to draw each path with: `[dashSize, gapSize]` relative to *half* the width of the path. A `getDashArray` of `[4, 5]` on a path 10 pixels wide therefore draws 20 pixel dashes separated by 25 pixel gaps.

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.


#### `dashJustified` (boolean, optional) {#dashjustified}

* Default: `false`

Only effective if `getDashArray` is specified. If `true`, adjust gaps for the dashes to align at both ends. Combines with `dashMode`: it justifies across each segment under `dashMode: 'segment'`, and across the whole path under `dashMode: 'path'`.

> Note: `dashJustified` and `dashMode` only apply to `PathLayer` and its composites. They have no effect on `ScatterplotLayer` or `TextLayer` backgrounds, which have continuous stroke geometry with no segment joints.


#### `getOffset` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors)) {#getoffset}

Must be specified if the `offset` option is enabled.

The offset to draw each path with, relative to the width of the path. Negative offset is to the left hand side, and positive offset is to the right hand side. `0` extrudes the path so that it is centered at the specified coordinates.

* If a number is provided, it is used as the offset for all paths.
* If a function is provided, it is called on each path to retrieve its offset.


#### `dashUnits` (string, optional) {#dashunits}

* Default: `'widths'`

What `getDashArray` is measured in, one of `'widths'`, `'pixels'`, `'meters'` and `'common'`.

`'widths'` is relative to half the stroke width, so a dash scales with the line. With the `PathLayer` default of `widthUnits: 'meters'` the stroke thickens as you zoom in, and the dashes thicken and lengthen with it.

`'pixels'` makes a dash an absolute size on screen, holding the same length at every zoom level regardless of `widthUnits`. `'meters'` and `'common'` instead pin it to the ground.

> Note: `dashUnits` applies to `PathLayer` and composite layers that render paths. `ScatterplotLayer` outlines and `TextLayer` backgrounds continue to interpret `getDashArray` relative to their stroke width.

```js
// A 20px dash and a 25px gap, unchanging as the user zooms
new PathLayer({
  ...
  widthUnits: 'meters',
  getWidth: 60,
  getDashArray: [20, 25],
  dashUnits: 'pixels',
  extensions: [new PathStyleExtension({dashMode: 'path'})]
});
```

#### `dashGapPickable` (boolean, optional) {#dashgappickable}

* Default `false`

Only effective if `getDashArray` is specified. If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable. 

## Remarks

### Limitations

WebGL2 has guaranteed support for up to 16 attributes per shader. The current implementation of `PathLayer` uses 13 attributes. Each one of the options of this extension adds one more attribute. In other words, if all options are enabled, the layer will not be able to use other extensions.

### Tips on Rendering Dash Lines

`dashMode` decides what the dash pattern is measured against, and `dashJustified` decides whether the pattern is stretched to finish cleanly at both ends. They compose, giving four combinations.

#### `dashMode: 'segment'` (default)

The pattern restarts at every vertex. This is the cheapest option and renders dashes at exactly the lengths you specify, so it works well for data made of long, disjoint paths.

Its limitation is that a dash then depends on how the path happens to be divided into segments rather than on the stroke itself. Where segments are shorter than one dash period, no gap ever falls inside a segment and **the path renders as a solid line** — a common surprise with densely sampled geometry such as GPS traces, generalized coastlines, or circles approximated by many short chords. Zooming in eventually makes the dashes appear, because segments grow relative to the stroke width.

#### `dashMode: 'path'`

The pattern runs continuously from the start of each path, so it is invariant to how the path is tessellated: the same line dashes identically whether it is built from 2 vertices or 200. Choose this whenever paths contain many short segments, or whenever dashes must stay stable while the data is simplified or re-sampled.

The cost is a CPU pass over the geometry to accumulate distance, plus one vertex attribute, so it uses more resources on large datasets.

#### `dashJustified`

Stretches the period so that a whole number of periods spans the run, starting half a dash in so both ends finish on a joint. Under `dashMode: 'segment'` the run is each individual segment, which guarantees sharp, well-defined corners for polyline shapes but can make gap sizes look uneven from one segment to the next. Under `dashMode: 'path'` the run is the entire path, which keeps the gaps even while still landing cleanly on both ends.

### Dash Anti-aliasing

Dash coverage is prefiltered: rather than testing whether a fragment's centre falls inside a dash, the extension integrates the dash pattern over the fragment. Dash ends are therefore anti-aliased, and when a whole dash period becomes smaller than a pixel the stroke fades toward a uniform tone at the pattern's duty cycle instead of breaking into aliasing artifacts. No configuration is needed.

Picking is unaffected and remains a hard in-or-out test, so `dashGapPickable` keeps its exact meaning.


## Source

[modules/extensions/src/path-style](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/path-style)

Design rationale for `dashMode` and `dashUnits` is in [dev-docs/RFCs/v9.4/path-dash-rfc.md](https://github.com/visgl/deck.gl/tree/master/dev-docs/RFCs/v9.4/path-dash-rfc.md).
