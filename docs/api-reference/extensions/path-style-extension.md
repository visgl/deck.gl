
# PathStyleExtension

The `PathStyleExtension` adds selected features to the [PathLayer](../layers/path-layer.md) and composite layers that render the `PathLayer`, e.g. [PolygonLayer](../layers/polygon-layer.md) and [GeoJsonLayer](../layers/geojson-layer.md).

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
* `highPrecisionDash` (boolean) - improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead, see "Remarks" below. Default `false`.
* `offset` (boolean) - add capability to offset lines. Default `false`.

## Layer Properties

When added to a layer via the `extensions` prop, the `PathStyleExtension` adds the following properties to the layer:


#### `getDashArray` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors)) {#getdasharray}

Must be specified if the `dash` option is enabled.

The dash array to draw each path with: `[dashSize, gapSize]` relative to the width of the path.

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.


#### `dashJustified` (boolean, optional) {#dashjustified}

* Default: `false`

Only effective if `getDashArray` is specified. If `true`, adjust gaps for the dashes to align at both ends. Overrides the effect of `highPrecisionDash`.


#### `getOffset` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors)) {#getoffset}

Must be specified if the `offset` option is enabled.

The offset to draw each path with, relative to the width of the path. Negative offset is to the left hand side, and positive offset is to the right hand side. `0` extrudes the path so that it is centered at the specified coordinates.

* If a number is provided, it is used as the offset for all paths.
* If a function is provided, it is called on each path to retrieve its offset.


#### `dashGapPickable` (boolean, optional) {#dashgappickable}

* Default `false`

Only effective if `getDashArray` is specified. If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable. 

## Remarks

### Limitations

WebGL2 has guaranteed support for up to 16 attributes per shader. The current implementation of `PathLayer` uses 13 attributes. Each one of the options of this extension adds one more attribute. In other words, if all options are enabled, the layer will not be able to use other extensions.

### Tips on Rendering Dash Lines

There are three modes to render dash lines with this extension:

1. Default: dash starts from the beginning of each line segment
2. Justified: dash is stretched to center on each line segment
3. High precision: dash is evaluated continuously from the beginning of a path

![Comparison between dash modes](https://user-images.githubusercontent.com/2059298/93418881-33555280-f860-11ea-82cc-b57ecf2e48ce.png)

The above table illustrates the visual behavior of the three modes.

The default mode works best if the data consists of long, disjoint paths. It renders dashes at exactly the defined lengths.

The justified mode is guaranteed to render sharp, well-defined corners. This is great for rendering polyline shapes. However, the gap size may look inconsistent across line segments due to stretching.

The high precision mode pre-calculates path length on the CPU, so it may be slower and use more resources for large datasets. When a path contains a lot of short segments, this mode yields the best result.


## Source

[modules/extensions/src/path-style](https://github.com/visgl/deck.gl/tree/9.1-release/modules/extensions/src/path-style)
