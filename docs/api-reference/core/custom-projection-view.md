# CustomProjectionView (Experimental)

`CustomProjectionView` renders a planar map using application-supplied coordinate conversion functions. It uses [CustomProjectionViewport](./custom-projection-viewport.md) and [CustomProjectionController](./custom-projection-controller.md).

This API is experimental and may change. Import it as `_CustomProjectionView` from `@deck.gl/core` or `deck.gl`.

## Usage

This example uses [proj4](https://github.com/proj4js/proj4js) to configure an Equal Earth view. Install it with `npm install proj4@^2.22.0` alongside deck.gl.

```js
import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import proj4 from 'proj4';

// WGS 84 longitude/latitude to Equal Earth (EPSG:8857), in meters.
const fromCrs = 'EPSG:4326';
const toCrs = '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m';
const projection = proj4(fromCrs, toCrs);

// Equal Earth's full-world projected extent.
const east = projection.forward([180, 0])[0];
const north = projection.forward([0, 90])[1];

new Deck({
  views: new CustomProjectionView({
    projection,
    fromCrs,
    toCrs,
    fromBounds: [-180, -90, 180, 90],
    toBounds: [-east, -north, east, north]
  }),
  controller: true,
  initialViewState: {center: [256, 256, 0], zoom: 1}
});
```

deck.gl does not bundle a projection library. Supply the converter through `projection`. Changing `projection` alone does not trigger an update to layer positions. Change `fromCrs` or `toCrs` along with the converter to trigger that update.

### Converting UTM coordinates to Web Mercator

This example uses UTM zone 10N eastings and northings as world coordinates and converts them to Web Mercator. `getMetersPerUnit` tells deck.gl that each world-coordinate unit represents one meter; deck.gl derives the projected scale through the converter.

```js
const fromCrs = '+proj=utm +zone=10 +datum=WGS84 +units=m';
const toCrs = 'EPSG:3857';
const projection = proj4(fromCrs, toCrs);

// Web Mercator's standard world extent in meters.
const extent = Math.PI * 6378137;

const view = new CustomProjectionView({
  projection,
  fromCrs,
  toCrs,
  toBounds: [-extent, -extent, extent, extent],
  getMetersPerUnit: () => [1, 1, 1],
  resolution: 100000
});
```

The callback describes meters per unit of world coordinates, which are expressed in `fromCrs`—UTM meters in this example. deck.gl makes a best effort to deduce world-coordinate units from `fromCrs`. When it cannot, `getMetersPerUnit` is required to override the default longitude/latitude estimation. `resolution` is also measured in world-coordinate units.

## Constructor

Inherits [View options](./view.md#constructor), including layout, padding, controller settings and GPU parameters. Additional options:

| Option | Default | Description |
| --- | --- | --- |
| `projection` | Required | `{forward, inverse}` conversion functions. See the [coordinate contract](./custom-projection-viewport.md#coordinate-contract). |
| `fromCrs` | None | CRS name or PROJ string describing world coordinates. Changing this string refreshes projected positions. A PROJ string containing `+units=m` defaults to meter units; otherwise longitude/latitude degrees are assumed. |
| `toCrs` | None | Output CRS name or PROJ string. Changing this string refreshes projected positions. |
| `fromBounds` | None | The projection's valid domain, expressed as `[minX, minY, maxX, maxY]` in world coordinates (`fromCrs`). |
| `toBounds` | Required | The projection's extent, expressed as `[minX, minY, maxX, maxY]` in `toCrs`. |
| `resolution` | `5` | Controls how closely paths and polygon edges follow the projection. Lower values produce smoother curves but take longer to process. Measured in world-coordinate units (`fromCrs`). |
| `getMetersPerUnit` | None | `(worldPosition) => [x, y, z]`: finite, positive physical meters per world-coordinate unit along each axis. `worldPosition` is expressed in `fromCrs`. Overrides the inferred scale when supplied. With `+units=m` in `fromCrs`, defaults to `() => [1, 1, 1]`; otherwise uses longitude/latitude estimation with altitude in meters. Supply this callback for other world-coordinate units. |
| `orthographic` | `false` | Use an orthographic camera instead of perspective. |

Coordinates outside `fromBounds` are clamped to its boundary, not clipped. The bounds describe the projection itself; use the view state to choose the visible region.

CRS strings do not construct or configure the converter. Named CRSs are not resolved to their definitions: `'EPSG:4326'`, `'WGS84'`, NAD83, NAD27 and unrecognized names all use longitude/latitude estimation by default. When world coordinates use a named projected CRS measured in meters, supply `getMetersPerUnit: () => [1, 1, 1]` or use a PROJ string containing `+units=m`.

## View State

| Property | Default | Description |
| --- | --- | --- |
| `center` | `[256, 256, 0]` | Camera center in normalized common coordinates, not longitude/latitude. Navigation locks Z to zero. |
| `zoom` | `0` | Each increment doubles the scale. |
| `pitch` | `0` | Map pitch in degrees, as in `MapView`. |
| `bearing` | `0` | Map bearing in degrees, as in `MapView`. |
| `minZoom`, `maxZoom` | `-Infinity`, `Infinity` | Zoom constraints; controller bounds may impose an additional minimum. |
| `minPitch`, `maxPitch` | `0`, `85` | Pitch constraints, clamped to the range 0–85 degrees. |

To center on a world position in `fromCrs`, such as a city's longitude/latitude when using `'EPSG:4326'`, use the viewport's `preproject(position)` result as `center`.

TypeScript configuration types are exported as `CustomProjectionViewProps`, `CustomProjectionViewState`, `CustomProjectionViewportOptions` and `ProjectionConverter`. Like the classes, these types are experimental.

## Controller

Enable interaction with `controller: true`. The default [CustomProjectionController](./custom-projection-controller.md) pans and zooms in common space, with map-style pitch and bearing controls. Its default bounds are the common-space square `[[0, 0], [512, 512]]`; use `controller: {maxBounds: null}` to allow unrestricted panning.

## Changing Projections

To change the projection at runtime, supply the updated converter, CRS strings and bounds. Changing either `fromCrs` or `toCrs` refreshes projected positions. Replacing `projection` alone does not trigger this refresh. If both CRS strings are omitted, deck.gl assumes the conversion is stable. Changing a registered CRS definition without changing its name is not detected.

Changing `resolution` also refreshes projected positions. Bounds are properties of the CRS and do not independently trigger a refresh. Replacing `getMetersPerUnit` or navigating the camera does not trigger a refresh either.

Use a new layer ID when switching a layer between `MapView` and `CustomProjectionView`. When displaying multiple views with different projections, create a separate layer instance with a unique ID for each view, and use `layerFilter` to restrict each instance to its intended view.

## Limitations

- Supported layers are `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`, including their use by `PolygonLayer` and the corresponding `GeoJsonLayer` sublayers. Other layers are not yet supported.
- Tiled layers and `WMSLayer` are not supported, including `TileLayer`, `Tile3DLayer`, `MVTLayer`, `TerrainLayer` and layers built on them.
- Meter scale is approximated at the viewport center. Meter-based sizes may not reflect distortion elsewhere in the projection.
- The layer's `coordinateSystem` and `coordinateOrigin` are ignored when used with this view. Supply positions in the coordinates expected by `projection.forward`. `modelMatrix` is applied before conversion.
- Split geometry at projection discontinuities before passing it to the layer. This view does not automatically clip geometry at those boundaries. The converter must return finite coordinates for the geometry you render.
- Picked coordinates are returned as world coordinates in `fromCrs`. They may be unavailable where `projection.inverse` cannot return a valid position.

## Source

[modules/core/src/views/custom-projection-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/custom-projection-view.ts)
