# CustomProjectionViewport (Experimental)

`CustomProjectionViewport` combines a planar map camera with application-supplied forward and inverse coordinate conversions. It is created by [CustomProjectionView](./custom-projection-view.md).

This API is experimental and may change. Import it as `_CustomProjectionViewport` from `@deck.gl/core` or `deck.gl`.

## Usage

```js
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';

const viewport = new CustomProjectionViewport({
  width: 800,
  height: 600,
  projection: {forward: p => p.slice(), inverse: p => p.slice()},
  outputBounds: [-180, -90, 180, 90],
  target: [256, 256, 0],
  zoom: 0,
  pitch: 30,
  bearing: 20
});

const common = viewport.preproject([0, 0]); // [256, 256, 0]
const pixel = viewport.project(common); // [400, 300, depth]
const input = viewport.postUnproject(viewport.unproject(pixel)); // [0, 0, 0]
```

## Constructor

Accepts the [View's projection options](./custom-projection-view.md#constructor), plus `width`, `height`, `x`, `y`, pixel `padding`, `zoom` (default `0`), `target` (default `[256, 256, 0]`), `pitch` (default `0`) and `bearing` (default `0`). The view state and viewport both use MapView-style `pitch` and `bearing`.

Zero width or height becomes `1`. Bounds must be finite and increasing. `resolution` and `zScale` must be finite and positive. The camera uses the same default field of view and clipping multipliers as `WebMercatorViewport`. `orthographic` defaults to `false`.

## Coordinate Contract

Three spaces are distinct:

1. **Input coordinates**, such as longitude/latitude/altitude, belong to the application.
2. **Output projection coordinates** are returned by `projection.forward(input)`. `projection.inverse(output)` converts back to input coordinates or returns `null` outside its domain.
3. **Common coordinates** are the normalized output used by the camera and GPU.

For `outputBounds: [minX, minY, maxX, maxY]`, let `scale = 512 / max(maxX - minX, maxY - minY)`. Normalization preserves aspect ratio, centers XY at `[256, 256]`, and maps the longest extent to 512 units:

```text
commonX = (outputX - (minX + maxX) / 2) * scale + 256
commonY = (outputY - (minY + maxY) / 2) * scale + 256
commonZ = outputZ * zScale * scale
```

If the forward converter omits Z, input Z is retained, defaulting to zero. Positive common Y points up and positive Z points out of the map. Conversion receives a copy of the input array. Optional `inputBounds` clamps XY but does not alter Z.

For Web Mercator alignment, a converter that returns the usual 512-unit Mercator common coordinates and `outputBounds: [0, 0, 512, 512]` needs no additional normalization. Set `target` to the projected map center and use the same `zoom`, `pitch`, `bearing` and dimensions as `WebMercatorViewport`. Converting altitude in meters to common Z is the converter's responsibility.

## Methods and Properties

Inherits [Viewport](./viewport.md) methods, with the following coordinate semantics:

### `preproject(position)`

Converts an input position to `[commonX, commonY, commonZ]`. It is independent of the current camera position, zoom, pitch and bearing.

### `postUnproject(position)`

Converts common coordinates back to input coordinates. Returns `null` when the inverse throws, returns non-finite values, or fails an XY forward round-trip check. A valid inverse is then clamped to `inputBounds`, if supplied.

### `project(position, options)`

Projects **common coordinates** to screen pixels. Call `preproject` first for input coordinates. The inherited `topLeft` option defaults to `true`. Three-component input returns pixel depth as its third component.

### `unproject(pixels, options)`

Returns **common coordinates**. If pixel depth is absent, `targetZ` selects a common-space plane, defaulting to zero; it is not a meter distance. Call `postUnproject` to recover input coordinates. `topLeft` defaults to `true`.

### `projectPosition`, `unprojectPosition`, `projectFlat`, `unprojectFlat`

These operate on common coordinates and do not call the converter. The position methods return XYZ (default Z `0`); the flat methods return XY.

### `panByPosition(position, pixel)`

Returns `{target}` that keeps a common-space ground point under the requested pixel. The returned target has Z `0`.

### `getDistanceScales()`

Returns local `unitsPerMeter` and `metersPerUnit` estimates at the current target. These affect meter-sized styling, not coordinate normalization. `getUnitsPerMeter` overrides automatic estimation.

### `projectionSignature`

An opaque signature identifying conversion and tessellation configuration. It changes with converter identity, `projectionId`, input/output bounds, `zScale` and `resolution`, but not navigation. Layers use it to invalidate projected positions.

## Source

[modules/core/src/viewports/custom-projection-viewport.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/custom-projection-viewport.ts)
