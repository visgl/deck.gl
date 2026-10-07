# CustomProjectionView (Experimental)

`CustomProjectionView` renders a planar map using application-supplied coordinate conversion functions. It supports 2D map projections, not globe projections or arbitrary 3D coordinate transformations. Layers can still display altitude and extruded geometry. It uses [CustomProjectionViewport](./custom-projection-viewport.md) and [CustomProjectionController](./custom-projection-controller.md).

The converter returns XYZ in **map meters**: X/Y locate a point on the planar map, and Z represents altitude in meters. World coordinates can use other units, provided the converter converts them to map meters. See the [coordinate contract](./custom-projection-viewport.md#coordinate-contract).

This API is experimental and may change. Import it as `_CustomProjectionView` from `@deck.gl/core` or `deck.gl`.

## Usage

This example uses [proj4](https://github.com/proj4js/proj4js) to configure an Equal Earth view. deck.gl does not bundle a projection library.

```js
import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import proj4 from 'proj4';

// WGS 84 longitude/latitude to Equal Earth (EPSG:8857), in meters.
const fromCrs = 'EPSG:4326';
const toCrs = '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m';

new Deck({
  views: new CustomProjectionView({
    fromCrs,
    toCrs,
    projection: proj4(fromCrs, toCrs),
    fromBounds: [-180, -90, 180, 90],
    resolution: 5 // degrees in fromCrs
  }),
  controller: true,
  initialViewState: {center: [0, 0, 0], zoom: 1}
});
```

This example uses UTM zone 10N eastings and northings as world coordinates and converts them to Web Mercator.

```js
const fromCrs = '+proj=utm +zone=10 +datum=WGS84 +units=m';
const toCrs = 'EPSG:3857';

const view = new CustomProjectionView({
  fromCrs,
  toCrs,
  projection: proj4(fromCrs, toCrs),
  resolution: 100000  // in world-coordinate (fromCrs) units aka meters
});
```

## Constructor

Inherits [View options](./view.md#constructor), including layout, padding, controller settings and GPU parameters. Additional options:

| Option | Default | Description |
| --- | --- | --- |
| `projection` | Required | `{forward, inverse}` conversion functions. See the [coordinate contract](./custom-projection-viewport.md#coordinate-contract). |
| `fromCrs` | `'WGS84'` | CRS name or PROJ string describing world coordinates. |
| `toCrs` | None | Planar, meter-based map CRS name or PROJ string. |
| `fromBounds` | None | The projection's valid domain, expressed as `[minX, minY, maxX, maxY]` in world coordinates (`fromCrs`). |
| `resolution` | `0` | Set a positive value in world-coordinate units (`fromCrs`) to subdivide paths and polygon edges so they follow the projection. Smaller positive values produce smoother curves but take longer to process. `0` disables subdivision. |
| `getDistanceScale` | None | `([x, y]) => [xScale, yScale]`, with `[x, y]` in `toCrs`: real-world ground meters per map meter along X/Y, to adjust for horizontal projection distortion. Altitude does not affect scale. See [meter size](./custom-projection-viewport.md#meter-size). |
| `orthographic` | `false` | Use an orthographic camera instead of perspective. |

Coordinates outside `fromBounds` are clamped to its boundary, not clipped. `fromBounds` describes the projection's valid domain.

CRS strings are used to uniquely identify the projection. They do not construct the converter.


## View State

| Property | Default | Description |
| --- | --- | --- |
| `center` | `[0, 0, 0]` | Camera center in world coordinates (`fromCrs`). Navigation locks Z to zero. |
| `zoom` | `0` | Each increment doubles the scale. |
| `pitch` | `0` | Map pitch in degrees, as in `MapView`. |
| `bearing` | `0` | Map bearing in degrees, as in `MapView`. |
| `minZoom`, `maxZoom` | `-Infinity`, `Infinity` | Zoom constraints; controller bounds may impose an additional minimum. |
| `minPitch`, `maxPitch` | `0`, `85` | Pitch constraints, clamped to the range 0–85 degrees. |

To center on a city when using `fromCrs: 'EPSG:4326'`, supply its longitude and latitude directly, for example `center: [-122.4, 37.8, 0]`.

TypeScript configuration types are exported as `CustomProjectionViewProps`, `CustomProjectionViewState`, `CustomProjectionViewportOptions` and `ProjectionConverter`. Like the classes, these types are experimental.

## Controller

Enable interaction with `controller: true`. The default [CustomProjectionController](./custom-projection-controller.md) pans and zooms in common space, with map-style pitch and bearing controls. Panning is unrestricted unless you supply `controller.maxBounds` in world coordinates (`fromCrs`).

## Changing Projections

`CustomProjectionView` supports swapping the custom projection at runtime. To avoid unnecessary updates, a new `projection` object alone does not trigger layer updates. To refresh projected positions, change one or more of: `fromCrs`, `toCrs`, or `resolution` alongside the updated converter.

Use a new layer ID when switching a layer between `MapView` and `CustomProjectionView`.

When displaying multiple views with different projections, create a separate layer instance with a unique ID for each view, and use `layerFilter` to restrict each instance to its intended view.

## Limitations

- Supported layers are `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`, including their use by `PolygonLayer` and the corresponding `GeoJsonLayer` sublayers. Other layers are not yet supported.
- Tiled layers and `WMSLayer` are not supported, including `TileLayer`, `Tile3DLayer`, `MVTLayer`, `TerrainLayer` and layers built on them.
- Meter scale is approximated at the viewport center. Meter-based sizes may not reflect distortion elsewhere in the projection.
- With `coordinateSystem: 'default'`, layer positions are interpreted as coordinates in `fromCrs`. `modelMatrix` is applied before conversion,  and `coordinateOrigin` is ignored. Bypass this behavior with `coordinateSystem: 'cartesian'`. Cartesian positions are in map meters in `toCrs`, and `modelMatrix` and `coordinateOrigin` both apply.
- Split geometry at projection discontinuities before passing it to the layer. This view does not automatically clip geometry at those boundaries. The converter must return finite coordinates for the geometry you render.
- Picked coordinates are returned as world coordinates in `fromCrs`. They may be unavailable where `projection.inverse` cannot return a valid position.

## Source

[modules/core/src/views/custom-projection-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/custom-projection-view.ts)
