
# StrokeStyleExtension

The `StrokeStyleExtension` adds the capability to render dashed strokes on layers that use SDF-based stroke rendering. It supports:

- [ScatterplotLayer](../layers/scatterplot-layer.md) - dashed circle strokes
- [TextBackgroundLayer](../layers/text-background-layer.md) - dashed rectangle strokes (including rounded corners)

```js
import {ScatterplotLayer} from '@deck.gl/layers';
import {StrokeStyleExtension} from '@deck.gl/extensions';

const layer = new ScatterplotLayer({
  id: 'scatterplot-layer',
  data,
  stroked: true,
  filled: true,
  getPosition: d => d.coordinates,
  getRadius: d => d.radius,
  getFillColor: [255, 200, 0],
  getLineColor: [0, 0, 0],
  getDashArray: [3, 2],
  dashGapPickable: false,
  extensions: [new StrokeStyleExtension({dash: true})]
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
import {StrokeStyleExtension} from '@deck.gl/extensions';
new StrokeStyleExtension({dash: true});
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
new deck.StrokeStyleExtension({dash: true});
```

## Constructor

```js
new StrokeStyleExtension({dash});
```

* `dash` (boolean) - add capability to render dashed strokes. Default `true`.

## Layer Properties

When added to a layer via the `extensions` prop, the `StrokeStyleExtension` adds the following properties to the layer:

#### `getDashArray` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors)) {#getdasharray}

The dash array to draw each stroke with: `[dashSize, gapSize]` relative to the width of the stroke.

* If an array is provided, it is used as the dash array for all objects.
* If a function is provided, it is called on each object to retrieve its dash array. Return `[0, 0]` to draw the stroke as a solid line.
* Default: `[0, 0]` (solid line)

#### `dashGapPickable` (boolean, optional) {#dashgappickable}

* Default: `false`

Only effective if `getDashArray` is specified. If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable.

## Supported Layers

### ScatterplotLayer

For `ScatterplotLayer`, the dash pattern is calculated based on the **angle around the circle's circumference**. The stroke must be enabled via `stroked: true`.

```js
new ScatterplotLayer({
  data,
  stroked: true,
  filled: true,
  getPosition: d => d.coordinates,
  getRadius: 100,
  getLineColor: [0, 0, 0],
  getLineWidth: 2,
  getDashArray: [3, 2],  // 3 units solid, 2 units gap
  extensions: [new StrokeStyleExtension({dash: true})]
});
```

When a circle is both stroked and filled, the fill color shows through the gaps in the dash pattern. When only stroked (no fill), fragments in gaps are discarded.

### TextBackgroundLayer

For `TextBackgroundLayer`, the dash pattern is calculated based on the **perimeter position around the rectangle**. This includes proper handling of rounded corners when `borderRadius` is set.

```js
new TextBackgroundLayer({
  data,
  getPosition: d => d.coordinates,
  getBoundingRect: d => d.bounds,
  getLineColor: [0, 0, 0],
  getLineWidth: 2,
  borderRadius: 8,  // Dashes will flow smoothly around corners
  getDashArray: [4, 2],
  extensions: [new StrokeStyleExtension({dash: true})]
});
```

The perimeter calculation accounts for:
- Straight edges (reduced by corner radii)
- Corner arcs (quarter circles based on border radius)
- Different radii for each corner (when `borderRadius` is specified as `[topRight, bottomRight, bottomLeft, topLeft]`)

## Comparison with PathStyleExtension

| Feature | PathStyleExtension | StrokeStyleExtension |
|---------|-------------------|---------------------|
| **Target Layers** | PathLayer, PolygonLayer, GeoJsonLayer | ScatterplotLayer, TextBackgroundLayer |
| **getDashArray** | ✓ | ✓ |
| **dashGapPickable** | ✓ | ✓ |
| **getOffset** | ✓ | ✗ |
| **dashJustified** | ✓ | ✗ |
| **highPrecisionDash** | ✓ | ✗ |
| **Rendering Method** | Path geometry extrusion | SDF (Signed Distance Field) |

Use `PathStyleExtension` for path-based layers and `StrokeStyleExtension` for SDF-based layers.

## Remarks

### How It Works

Unlike `PathStyleExtension` which works with path geometry, `StrokeStyleExtension` works with layers that render strokes using Signed Distance Fields (SDF) in the fragment shader:

- **ScatterplotLayer**: Uses angle-based position calculation. The position along the stroke is determined by the angle from the circle's center (0 to 2π radians).
- **TextBackgroundLayer**: Uses perimeter-based position calculation. The position is traced clockwise around the rectangle's perimeter, including arc lengths for rounded corners.

### Performance

The extension uses shader injection to add dash calculations. Each supported layer type receives only its specific shader code at compile time, so there is no runtime overhead from supporting multiple layer types.

## Source

[modules/extensions/src/stroke-style](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/stroke-style)
