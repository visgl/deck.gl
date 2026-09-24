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
  center: [256, 256, 0],
  zoom: 0,
  pitch: 30,
  bearing: 20
});

const common = viewport.preproject([0, 0]); // [256, 256, 0]
const pixel = viewport.project(common); // [400, 300, depth]
const input = viewport.postUnproject(viewport.unproject(pixel)); // [0, 0, 0]
```

## Constructor

Accepts the [View's projection options](./custom-projection-view.md#constructor), plus `width`, `height`, `x`, `y`, pixel `padding`, `zoom` (default `0`), `center` (default `[256, 256, 0]`), `pitch` (default `0`) and `bearing` (default `0`). The view state and viewport both use MapView-style `pitch` and `bearing`.

Zero width or height becomes `1`. Bounds must be finite and increasing. `resolution` must be finite and positive. The camera uses the same default field of view and clipping multipliers as `WebMercatorViewport`. `orthographic` defaults to `false`.

## Coordinate Contract

Supply layer positions in the coordinates accepted by `projection.forward`, such as longitude, latitude and altitude. The converter returns projected X/Y coordinates; `projection.inverse` converts them back, or returns `null` outside its domain.

Altitude (Z) is in meters, including any Z returned by the converter. If the forward converter omits Z, the input altitude is retained, defaulting to zero. deck.gl handles altitude scaling; the converter should not scale altitude to match its projected X/Y units. Positive Z points out of the map.

Conversion receives a copy of the input array. `inputBounds` clamps X/Y but does not alter altitude.

Use `getUnitsPerMeter(inputPosition)` to override scale, returning `[x, y, z]` in projected units per meter. This lets you specify the scale when the converter uses custom coordinate units, including an independent altitude scale.

## Methods and Properties

Inherits [Viewport](./viewport.md) methods, with the following coordinate semantics:

### `preproject(position)`

Converts an input position to `[commonX, commonY, altitudeInMeters]`. It is independent of the current camera position, zoom, pitch and bearing.

### `postUnproject(position)`

Converts preprojected X/Y and altitude in meters back to input coordinates. Returns `null` when the inverse throws, returns non-finite values, or fails an XY forward round-trip check. A valid inverse is then clamped to `inputBounds`, if supplied.

### `project(position, options)`

Projects preprojected X/Y and altitude in meters to screen pixels. Call `preproject` first for input coordinates. The inherited `topLeft` option defaults to `true`. Three-component input returns pixel depth as its third component.

### `unproject(pixels, options)`

Returns preprojected X/Y and altitude in meters. If pixel depth is absent, `targetZ` specifies altitude in meters, defaulting to zero. Call `postUnproject` to recover input coordinates. `topLeft` defaults to `true`.

### `projectPosition`, `unprojectPosition`, `projectFlat`, `unprojectFlat`

These do not call the converter. `projectPosition` converts altitude in meters to common Z; `unprojectPosition` reverses that conversion. Both preserve X/Y. The flat methods return X/Y unchanged.

### `panByPosition(position, pixel)`

Returns `{center}` that keeps a common-space ground point under the requested pixel. The returned center has Z `0`.

### `getDistanceScales()`

Returns local `unitsPerMeter` and `metersPerUnit` estimates at the current center. These affect meter-sized styling, not coordinate normalization. `getUnitsPerMeter` overrides automatic estimation.

### `projectionSignature`

An opaque signature identifying conversion and tessellation configuration. It changes with converter identity, `projectionId`, input/output bounds and `resolution`, but not navigation. Layers use it to invalidate projected positions.

## Source

[modules/core/src/viewports/custom-projection-viewport.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/custom-projection-viewport.ts)
