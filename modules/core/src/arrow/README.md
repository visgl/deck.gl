# Arrow conversion prototype

Import ArrowConverter directly from @deck.gl/core/arrow. This optional subpath depends on Apache Arrow and luma.gl core/GPU-data, without @luma.gl/arrow or registration.

The converter uploads numeric scalars, XY/XYZ positions, and RGB/RGBA colors. It converts each Arrow chunk separately, preserving Float64 residuals and interpreting float colors in [0, 1] and integer colors in [0, 255]. Supported output formats are float32, float32x2/x3/x4, and unorm8x4. Nulls are rejected by default; nullPolicy: 'preserve' exports a uint32 validity vector alongside the values.

Results own their GPU buffers. Call result.destroy() after their last GPU use; the Arrow inputs remain caller-owned. Batch conversion rolls back partial uploads on failure.

convertVectors and convertBatches consume async iterables, bare async iterators, and synchronous iterables. Each output request pulls one input; neither method prefetches or concatenates earlier batches. Early exit closes the source. Abort cancels a pending read and releases unyielded results; already yielded results stay caller-owned.

Standard ScatterplotLayer accepts `positions`, `radii`, `fillColors`, `lineColors`, and `lineWidths` alongside its accessor props. When supplied, a column overrides its matching accessor. The layer loads ArrowConverter directly; no registration is needed. Column mode binds GPU vectors to the model without AttributeManager. Attribute transitions and attribute-providing extensions are currently unsupported in column mode.

```ts
import {ScatterplotLayer} from '@deck.gl/layers';

const layer = new ScatterplotLayer({
  data: rows,
  positions: positionVector,
  radii: radiusVector,
  fillColors: colorVector
});
```
