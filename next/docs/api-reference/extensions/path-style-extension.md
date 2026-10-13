# PathStyleExtension

<!-- -->

The `PathStyleExtension` adds dashes and offsets to the [PathLayer](https://deck.gl/next/docs/api-reference/layers/path-layer.md) and composite layers that render paths, such as [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) and [GeoJsonLayer](https://deck.gl/next/docs/api-reference/layers/geojson-layer.md). It can also dash [ScatterplotLayer](https://deck.gl/next/docs/api-reference/layers/scatterplot-layer.md) outlines and [TextLayer](https://deck.gl/next/docs/api-reference/layers/text-layer.md) backgrounds.

dashModepathdashUnitswidthsDash44Gap33Edge getOffset55

```
import {PathLayer} from '@deck.gl/layers';

import {PathStyleExtension} from '@deck.gl/extensions';



// `path` is the road's centerline, an array of [longitude, latitude] positions

function getRoadLayer(path) {

  return new PathLayer({

    id: 'road',

    data: [

      {path, dashArray: [4, 3], offset: 0, color: [60, 100, 160]}, // center line

      {path, dashArray: [0, 0], offset: -5, color: [0, 0, 0]}, // left edge

      {path, dashArray: [0, 0], offset: 5, color: [0, 0, 0]} // right edge

    ],

    getPath: d => d.path,

    getColor: d => d.color,

    getWidth: 2,



    // props added by PathStyleExtension

    getDashArray: d => d.dashArray,

    dashUnits: 'widths',

    getOffset: d => d.offset,



    extensions: [new PathStyleExtension({dashMode: 'path', offset: true})]

  });

}
```

> `PathStyleExtension` currently requires WebGL. Layers that use it do not render on WebGPU.

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```
import {PathStyleExtension} from '@deck.gl/extensions';

new PathStyleExtension({});
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```
new deck.PathStyleExtension({});
```

## Constructor[​](#constructor "Direct link to Constructor")

```
new PathStyleExtension({dash, dashMode, offset});
```

* `dash` (boolean) - add the ability to draw dashed lines. Default `false`.
* `dashMode` (string) - where the dash pattern starts over. `'segment'` restarts it at every vertex; `'path'` runs it continuously along the whole path. Setting `dashMode` also enables `dash`. Default `'segment'`. See [Choosing a dash mode](#choosing-a-dash-mode).
* `offset` (boolean) - add the ability to offset lines from their path. Default `false`.
* `highPrecisionDash` (boolean) - **deprecated**, use `dashMode: 'path'` instead.

## Layer Properties[​](#layer-properties "Direct link to Layer Properties")

When added to a layer via the `extensions` prop, the `PathStyleExtension` adds the following properties to the layer:

#### `getDashArray` ([Accessor\<number\[2\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors))[​](#getdasharray "Direct link to getdasharray")

The dash pattern to draw each path with: `[dashSize, gapSize]`, measured in [`dashUnits`](#dashunits). With the default units, `[4, 5]` on a 10 pixel wide path draws 20 pixel dashes separated by 25 pixel gaps.

* If an array is provided, it is used as the dash pattern for all paths.
* If a function is provided, it is called on each path to retrieve its dash pattern. Return `[0, 0]` to draw a solid line.
* If not specified, all paths are drawn as solid lines.

#### `dashUnits` (string, optional)[​](#dashunits "Direct link to dashunits")

* Default: `'widths'`

The units of `getDashArray`:

* `'widths'` - multiples of *half* the stroke width. Dashes grow and shrink with the line.
* `'pixels'` - screen pixels. Dashes keep their size on screen as you zoom. Approximate when the view is pitched.
* `'meters'` - meters on the ground. Use for real-world spacing such as lane markings.
* `'common'` - deck.gl [common space](https://deck.gl/next/docs/developer-guide/coordinate-systems.md#supported-units) units.

Only applies to `PathLayer` and its composites. `ScatterplotLayer` and `TextLayer` always use `'widths'`.

#### `dashJustified` (boolean, optional)[​](#dashjustified "Direct link to dashjustified")

* Default: `false`

If `true`, stretch or shrink the gaps so the pattern starts and ends on half a dash. In `'segment'` mode this fits the pattern to every segment, so each corner lands on a dash. In `'path'` mode it fits the pattern to the path's two ends. Leave it off when gap spacing must be exact.

Only applies to `PathLayer` and its composites.

#### `dashGapPickable` (boolean, optional)[​](#dashgappickable "Direct link to dashgappickable")

* Default: `false`

If `true`, the gaps between dashes are pickable. If `false`, only the dashes are pickable.

#### `getOffset` ([Accessor\<number>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors))[​](#getoffset "Direct link to getoffset")

The distance to shift each path sideways, in multiples of the stroke width. Positive values shift to the right of the path's direction and negative values to the left. `0` centers the line on its path.

* If a number is provided, it is used as the offset for all paths.
* If a function is provided, it is called on each path to retrieve its offset.

To offset by a fixed distance, divide it by the width: a 4 pixel wide line with `getOffset: 2` sits 8 pixels to the right.

## Remarks[​](#remarks "Direct link to Remarks")

### Choosing a dash mode[​](#choosing-a-dash-mode "Direct link to Choosing a dash mode")

`dashMode` decides where the pattern starts over.

dashModepathdashJustified\[ ]Dash33Gap22

```
new PathLayer({

  // ...

  getDashArray: [3, 2],

  dashJustified: false,

  extensions: [new PathStyleExtension({dashMode: 'path'})]

});
```

* `'path'` runs one pattern along the whole path, the same way MapLibre and SVG draw dashes. Adding or removing vertices does not change how it looks, so dense, simplified, or resampled data stays consistent. Use it for routes, GPS traces, and most other lines.
* `'segment'` restarts the pattern at every vertex. Use it when each segment is a shape of its own, such as building outlines whose corners should each land on a dash (with `dashJustified`). A segment shorter than one dash has no room for a gap and draws solid.

`'path'` mode measures each path on the CPU and uses one more vertex attribute.

### Coming from MapLibre or SVG[​](#coming-from-maplibre-or-svg "Direct link to Coming from MapLibre or SVG")

| To get                           | MapLibre                  | SVG                        | deck.gl                                         |
| -------------------------------- | ------------------------- | -------------------------- | ----------------------------------------------- |
| Dashes that scale with the line  | `line-dasharray: [2, 1]`  | —                          | `getDashArray: [4, 2]`                          |
| Dashes with a fixed screen size  | —                         | `stroke-dasharray="20 10"` | `getDashArray: [20, 10]`, `dashUnits: 'pixels'` |
| A pattern that runs continuously | Always                    | Always                     | `dashMode: 'path'`                              |
| A line shifted to one side       | `line-offset: 8` (pixels) | —                          | `getOffset: 2` on a 4 pixel line                |

Three differences cause most surprises:

* deck.gl defaults to `'segment'` mode, so dashes restart at every vertex. Set `dashMode: 'path'` to match other tools.
* `'widths'` measures dashes in *half* stroke widths. MapLibre measures in full widths, so double MapLibre values.
* `getOffset` is in stroke widths, not pixels.

> deck.gl v10 plans breaking changes to this extension to match other tools more closely. See the [v10 tracker](https://github.com/visgl/deck.gl/issues/10712).

### Troubleshooting[​](#troubleshooting "Direct link to Troubleshooting")

* **A dashed line draws solid, or dashes only appear when zoomed in.** In `'segment'` mode each segment restarts the pattern, and a segment shorter than one dash never reaches a gap. Dense data such as GPS traces hits this often. Use `dashMode: 'path'`.
* **The pattern changes when the data is simplified or resampled.** Same cause. Use `dashMode: 'path'`.
* **Gaps are uneven with `dashJustified`.** In `'segment'` mode each segment is fitted separately. Use `dashMode: 'path'` to fit the whole path at once.
* **Dashes grow and shrink as I zoom.** With `widthUnits: 'meters'`, the line and its `'widths'` dashes both scale with the map. Use `dashUnits: 'pixels'` to keep dashes the same size on screen.

## Limitations[​](#limitations "Direct link to Limitations")

* Requires WebGL. Layers that use `PathStyleExtension` do not render on WebGPU.
* `getDashArray` takes a single dash and gap. Dash-dot patterns are not supported.
* `ScatterplotLayer` and `TextLayer` support `getDashArray` and `dashGapPickable` only.
* WebGL2 guarantees 16 vertex attributes and `PathLayer` already uses 13. A dash pattern, `'path'` mode, and an offset use one each, so enabling all three leaves no room for another extension that adds attributes.

## Source[​](#source "Direct link to Source")

[modules/extensions/src/path-style](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/path-style)

The design of `dashMode` and `dashUnits` is described in the [path dash RFC](https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v9.4/path-dash-rfc.md).
