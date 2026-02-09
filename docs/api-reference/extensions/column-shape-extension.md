
# ColumnShapeExtension

The `ColumnShapeExtension` adds per-instance bevel shapes (dome, cone, flat) and radius scaling to the `ColumnLayer`. This enables visualizations such as tree canopies, architectural columns with domed or pointed caps, and 3D bar charts with styled tops.

```js
import {ColumnLayer} from '@deck.gl/layers';
import {ColumnShapeExtension} from '@deck.gl/extensions';

const layer = new ColumnLayer({
  data: TREES_DATA,
  extruded: true,
  diskResolution: 20,
  getPosition: d => d.position,
  getElevation: d => d.height,
  getFillColor: d => d.color,

  // ColumnShapeExtension props
  extensions: [new ColumnShapeExtension()],
  getBevel: d => ({segs: 8, height: d.canopyHeight, bulge: 0.2}),
  getRadius: d => d.canopyRadius / d.trunkRadius,
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
import {ColumnShapeExtension} from '@deck.gl/extensions';
new ColumnShapeExtension();
```

## Constructor

```js
new ColumnShapeExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `ColumnShapeExtension` adds the following properties to the layer:

### `getBevel` (Accessor&lt;BevelProp&gt;, optional) {#getbevel}

* Default: `'flat'`

The bevel shape for the top cap of each column instance.

Supported values:
- `'flat'`: No bevel (default flat top)
- `'dome'`: Rounded dome with 8 segments and smooth normals
- `'cone'`: Pointed cone shape (2 segments)
- `{segs, height, bulge}`: Full control over shape parameters
  - `segs` (number): Number of bevel segments. 0-1 = flat, 2 = cone, 3+ = dome
  - `height` (number): Bevel height in world units
  - `bulge` (number): Curve factor. 0 = standard dome, negative = concave, positive = convex

### `getRadius` (Accessor&lt;number&gt;, optional) {#getradius}

* Default: `1`

Per-instance radius multiplier. The final rendered radius is `radiusScale * getRadius(d)`.

## BevelProp Type

```typescript
type BevelProp =
  | 'flat'       // No bevel
  | 'dome'       // Dome with default segments
  | 'cone'       // Cone shape
  | {
      segs?: number;   // Bevel segments (0-1=flat, 2=cone, 3+=dome)
      height?: number; // Bevel height in world units
      bulge?: number;  // Curve factor (-1 to 1+)
    };
```

## Limitations

- Only works with `ColumnLayer` (and its subclasses like `GridCellLayer`).
- Requires `extruded: true` on the parent layer for bevel shapes to render.
- Custom `vertices` prop on ColumnLayer bypasses dome geometry generation.

## Source

[modules/extensions/src/column-shape](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/column-shape)
