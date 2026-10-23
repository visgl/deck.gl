# CustomProjectionViewport (Experimental)

`CustomProjectionViewport` combines a planar map camera with a prepared target CRS descriptor. [CustomProjectionView](./custom-projection-view.md) creates it after resolving that descriptor.

Import it as `_CustomProjectionViewport` from `@deck.gl/core` or `deck.gl`. This API is experimental and may change.

## Usage

```js
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import {projectionEngine} from '@math.gl/projection';

const crs = await projectionEngine.getCRS('EPSG:3857');
const viewport = new CustomProjectionViewport({
  crs,
  width: 800,
  height: 600,
  center: [0, 0, 0],
  zoom: 0,
  pitch: 30,
  bearing: 20
});

const common = viewport.projectPosition([0, 0, 0]); // [0, 0, 0]
const pixel = viewport.project([0, 0, 0]); // [400, 300, depth]
const world = viewport.unproject(pixel); // [0, 0, 0]
```

## Constructor

Requires a prepared `crs` descriptor. Accepts `width`, `height`, `x`, `y`, pixel `padding`, `zoom`, WGS84 `center`, `pitch`, `bearing`, `resolution` and `orthographic` as described in the [view options](./custom-projection-view.md#constructor).

Zero width or height becomes one. `resolution` must be finite and non-negative. All three target axes require positive, finite `metersPerUnit` metadata. The camera uses the same default field of view and clipping multipliers as `WebMercatorViewport`.

### Coordinate Contract

World positions use WGS84 longitude/latitude in degrees and altitude in meters. `crs.converter.WGS84.normalize` normalizes them for the target projection, and `.from` converts them to target CRS units. `.to` reverses the conversion.

Common space is a fixed linear scaling of target coordinates. For axis `i`, `unitsPerWorldUnit[i]` equals `crs` axis `metersPerUnit * 512 / 40075016.6855`. A target-coordinate foot therefore has 0.3048 times the common-space length of a target-coordinate meter. This scale is independent of camera state and projection distortion.

### Meter Size

`crs.getRenderingScale(targetPosition)` supplies ground meters per target coordinate unit along X, Y and Z. Common units per ground meter are `unitsPerWorldUnit[i] / renderingScale[i]`. The descriptor’s vertical factor encodes the horizontal Jacobian scalar in the target vertical unit. `unitsPerMeter[2]` therefore supplies the isotropic scalar for marker sizes and elevations; it is not recomputed from the X/Y factors.

The local scale field samples the descriptor's finite target-coordinate `renderingBounds`, including XY slopes for Taylor reconstruction. Failed samples stay invalid. Unbounded projections and unavailable local measurements use camera-center scales when rendering. See [view meter sizing](./custom-projection-view.md#meter-size).

## Methods and Properties

Inherits [Viewport](./viewport.md) methods with these coordinate semantics:

### `getPreprojection(sourceCrs)`

Returns `{preproject, unpreproject, packedCrs}` for the resolved source descriptor. When its signature matches the viewport's descriptor, both functions are `null` and attributes remain in target CRS units. Otherwise, conversion goes through WGS84 and the target descriptor's normalization. `unpreproject` reverses the conversion. These functions are independent of camera state and exclude layer transforms; layers retain them in internal state.

### `project(position, options)`

Projects WGS84 positions to screen pixels. The inherited `topLeft` option defaults to `true`. Three-component positions return pixel depth.

### `unproject(pixels, options)`

Returns WGS84 positions. The inherited `targetZ` option selects a plane at that WGS84 altitude in meters when depth is absent; its default is zero. Invalid inverses return nonfinite coordinates.

### `projectPosition`, `unprojectPosition`

Convert between WGS84 XYZ and common XYZ, including target axis unit conversion.

### `projectFlat`, `unprojectFlat`

Convert between target-coordinate XY and common-space XY using only the fixed linear scale. These methods ignore Z and do not call the CRS converter.

### `panByPosition(position, pixel)`

Returns a WGS84 `{center}` that keeps the supplied ground point under the requested pixel. The returned center has Z zero.

### `getDistanceScales(coordinateOrigin?)`

Returns ground-meter scales at a target-coordinate anchor. Without an anchor, returns camera-center scales. An explicitly unavailable measurement (`null`) falls back to those camera scales without changing them. Unexpected descriptor errors propagate to the caller. `unitsPerWorldUnit` remains the constant per-axis target-unit-to-common scale.

### `projectionSignature`

An opaque signature composed from the math.gl descriptor’s `signature` and `resolution`. Layers use it to invalidate projected positions. Camera state does not affect it.

## Source

[modules/core/src/viewports/custom-projection-viewport.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/custom-projection-viewport.ts)
