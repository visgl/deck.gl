# CustomProjectionViewport (Experimental)

`CustomProjectionViewport` combines a planar map camera with application-supplied forward and inverse coordinate conversions. It is created by [CustomProjectionView](./custom-projection-view.md).

This API is experimental and may change. Import it as `_CustomProjectionViewport` from `@deck.gl/core` or `deck.gl`.

## Usage

```js
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import proj4 from 'proj4';

const viewport = new CustomProjectionViewport({
  width: 800,
  height: 600,
  projection: proj4('EPSG:4326', 'EPSG:3857'),
  fromCrs: 'EPSG:4326',
  toCrs: 'EPSG:3857',
  center: [0, 0, 0],
  zoom: 0,
  pitch: 30,
  bearing: 20
});

const common = viewport.projectPosition([0, 0, 0]); // [256, 256, 0]
const pixel = viewport.project([0, 0, 0]); // [400, 300, depth]
const world = viewport.unproject(pixel); // [0, 0, 0]
```

## Constructor

Accepts the [View's projection options](./custom-projection-view.md#constructor), plus `width`, `height`, `x`, `y`, pixel `padding`, `zoom` (default `0`), `center` in `fromCrs` (default `[0, 0, 0]`), `pitch` (default `0`) and `bearing` (default `0`). The view state and viewport both use MapView-style `pitch` and `bearing`.

`toBounds` is optional. It defaults to `[-EC/2, -EC/2, EC/2, EC/2]`, where `EC = 40075016.6855`. This matches Web Mercator's common-space mapping in `MapView`. Override it when another scale or origin is needed.

Zero width or height becomes `1`. Bounds must be finite and increasing. `resolution` must be finite and non-negative; its default of `0` disables subdivision. Set a positive value in `fromCrs` units to enable subdivision. The camera uses the same default field of view and clipping multipliers as `WebMercatorViewport`. `orthographic` defaults to `false`.

### Coordinate Contract

Layer data is supplied in `fromCrs`, for example `fromCrs: 'WGS84'` indicates that an XYZ position represents longitude, latitude and altitude. `projection.forward` returns XYZ in **map meters** in `toCrs`: X/Y locate a point on the planar map, and Z represents altitude in meters. X/Y must be expressed in meters, not degrees or arbitrary units, so their scale is consistent with altitude.

Both converter functions may accept and return three-component positions: if world altitude uses another unit, `forward` must convert it to meters and `inverse` must reverse that conversion.

`projection.inverse` converts map-meter XYZ back to world coordinates in `fromCrs`, or returns `null` outside its domain. If `forward` omits Z, the original Z value is retained and must already be in meters, defaulting to zero.

If `fromBounds` is supplied, X and Y are clamped by the given range before projected.

### Meter Size

deck.gl layers allow an app to specify [size units](../../developer-guide/coordinate-systems.md#dimensions) in meters. One map meter may not represent one meter on the ground. All projections that flatten the Earth's spherical surface onto a 2D plane end up distorting distances and/or angles somehow. This **projection distortion** can vary by location and direction: for example, Web Mercator stretches distances more strongly toward the poles. See [Tissot's indicatrix](https://en.wikipedia.org/wiki/Tissot%27s_indicatrix) for how projections distort local shapes and sizes.

This viewport projects meter sizes (altitude, width, radius, etc.) so that they are true to ground distance.

By default, it makes a best effort to estimate the real-world distance between two coordinates in `fromCrs`. If `fromCrs` is detected as lng-lat in degrees, distance is calculated along the spherical surface of the earth. If `fromCrs` units is detected as meters (e.g. UTM) distance is calculated using their planar difference. Otherwise, no distortion correction is applied.

The user may override the default meter size mapping by supplying a `getDistanceScale` callback:

```ts
getDistanceScale(positionInToCrs: [x: number, y: number]) => [xScale: number, yScale: number]
```

The two positive, finite values describe the real-world ground distance represented by one map meter along X and Y at the given position. The callback receives only the viewport center's X/Y in `toCrs`; altitude does not affect scale. It controls horizontal distortion correction, not altitude-unit conversion. Altitude and scalar meter sizes such as radii use a uniform scale derived from the geometric mean of the two horizontal factors, preserving aspect ratio.

Specify `getDistanceScale: () => [1, 1]` to suppress distortion correction.


## Methods and Properties

Inherits [Viewport](./viewport.md) methods, with the following coordinate semantics:

### `preproject(position)`

Converts world coordinates to preprojected XY, preserving Z returned by the converter. It is independent of the current camera position, zoom, pitch and bearing.

### `postUnproject(position)`

Converts preprojected XY and altitude Z in meters back to world coordinates. Returns `null` when the inverse throws, returns non-finite values, or fails an XY forward round-trip check. A valid inverse is then clamped to `fromBounds`, if supplied.

### `project(position, options)`

Projects world coordinates in `fromCrs` to screen pixels. The inherited `topLeft` option defaults to `true`. Three-component positions return pixel depth as their third component.

### `unproject(pixels, options)`

Returns world coordinates in `fromCrs`. If pixel depth is absent, `targetZ` specifies altitude, defaulting to zero; this assumes the converter leaves altitude unchanged. `topLeft` defaults to `true`. Coordinates are non-finite when the converter cannot invert the position.

### `projectPosition`, `unprojectPosition`, `projectFlat`, `unprojectFlat`

`projectPosition` converts world XYZ to common XYZ, including the converter's altitude conversion and the rendering scale. `unprojectPosition` reverses it. `projectFlat` and `unprojectFlat` perform the XY conversion between world and common coordinates.

### `panByPosition(position, pixel)`

Returns `{center}` that keeps a world-coordinate ground point under the requested pixel. The returned center has Z `0`.

### `getDistanceScales()`

Returns local `unitsPerMeter` and `metersPerUnit` estimates at the current center. X and Y describe independent axis scales. Z describes a uniform scale based on horizontal projection distortion, used for both altitude in meters and aspect-ratio-preserving meter sizes.

### `projectionSignature`

An opaque signature based only on `fromCrs`, `toCrs` and `resolution`. Bounds, callback identities and navigation do not affect it. Layers use it to invalidate projected positions.

## Source

[modules/core/src/viewports/custom-projection-viewport.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/custom-projection-viewport.ts)
