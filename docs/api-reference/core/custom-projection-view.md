# CustomProjectionView (Experimental)

`CustomProjectionView` renders a planar map in a target CRS resolved by `@math.gl/projection`. Input positions and camera centers use WGS84 longitude/latitude in degrees and altitude in meters. It supports planar projections, with altitude and extruded geometry, using [CustomProjectionViewport](./custom-projection-viewport.md) and [CustomProjectionController](./custom-projection-controller.md).

Import it as `_CustomProjectionView` from `@deck.gl/core` or `deck.gl`. This API is experimental and may change.

## Usage

```js
import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';

new Deck({
  views: new CustomProjectionView({
    crs: '+proj=eqearth +lon_0=0 +datum=WGS84 +units=m',
    resolution: 72,
    controller: true
  }),
  initialViewState: {center: [0, 0, 0], zoom: 1}
});
```

The view resolves its CRS descriptor asynchronously using `projectionEngine.getCRS(crs)`. Deck waits for the descriptor before creating its viewport and controller. Resolution errors reach Deck's `onError` callback. For standalone viewport creation, see [CustomProjectionViewport](./custom-projection-viewport.md#usage).

## Constructor

Inherits [View options](./view.md#constructor), including layout, padding and controller settings.

| Option | Default | Description |
| --- | --- | --- |
| `crs` | Required | A supported planar CRS definition: an identifier such as `EPSG:3857`, a PROJ string, WKT, PROJJSON object, or math.gl spatial-reference object. Linear axis units are read from the descriptor. |
| `resolution` | `0` | Subdivision intervals around the earth for paths, polygons and bitmaps. The step is `EarthCircumference / resolution`, converted to source CRS units. Higher values generate more detailed geometry. Zero disables subdivision. |
| `orthographic` | `false` | Use an orthographic camera instead of perspective. |

The descriptor supplies conversion functions, WGS84 normalization, target-coordinate bounds and ground distance scales. For example, Web Mercator normalizes longitude and clamps latitude to its supported range. Bounds describe the size-sampling rectangle; they do not clip geometry.

## Methods

### `initialize()`

Resolves the target descriptor and returns a promise. Deck calls this automatically. When using the view directly, await `initialize()` before calling `makeViewport()`; the latter returns `null` while the descriptor is unavailable.

## View State

| Property | Default | Description |
| --- | --- | --- |
| `center` | `[0, 0, 0]` | WGS84 longitude, latitude and altitude. Navigation fixes altitude at zero. |
| `zoom` | `0` | Each increment doubles the scale. |
| `pitch` | `0` | Map pitch in degrees. |
| `bearing` | `0` | Map bearing in degrees. |
| `minZoom`, `maxZoom` | `-Infinity`, `Infinity` | Zoom constraints; controller bounds may impose an additional minimum. |
| `minPitch`, `maxPitch` | `0`, `85` | Pitch constraints, clamped to 0–85 degrees. |

The experimental TypeScript types are `CustomProjectionViewProps`, `CustomProjectionViewState` and `CustomProjectionViewportOptions`.

## Controller

Enable interaction with `controller: true`. The default controller pans and zooms on the common-space ground plane, with map-style pitch and bearing controls. Optional `controller.maxBounds` use WGS84 longitude/latitude.

## Meter Size

Meter-based widths, radii and elevations use ground distance scales from the CRS descriptor. The Earth model comes from the target CRS parameters, with a WGS84 ellipsoid fallback when unspecified. Scalar marker sizes and elevations use the descriptor’s Jacobian scalar, preserving aspect ratio and projected area. The determinant accounts for shear as well as axis scaling. Position altitude retains the fixed target-unit-to-common scale.

Local sizing uses a texture over the descriptor's finite bounds. Outside those bounds, where scale evaluation fails, or for an unbounded projection, rendering uses the viewport-center scales. Failed evaluations never enter the texture. A nonpositive or nonfinite Taylor reconstruction on a steep curve uses the positive sample at the cell center.

## Changing Projections

`CustomProjectionView` supports swapping the custom projection at runtime. Change `crs` to load a new descriptor and refresh projected positions. Changing `resolution` also rebuilds subdivided geometry.

Use a new layer ID when switching a layer between `MapView` and `CustomProjectionView`.

When displaying multiple views with different projections, create a separate layer instance with a unique ID for each view, and use `layerFilter` to restrict each instance to its intended view.

## Limitations

- Tiled layers and `WMSLayer` are not supported, including `TileLayer`, `Tile3DLayer`, `MVTLayer`, `TerrainLayer` and layers built on them.
- `BitmapLayer` approximates the projection with a triangle mesh. A positive `resolution` creates an interior grid in the source CRS and projects every grid vertex; higher values improve the approximation at a higher processing cost. Image coordinates are linearly interpolated within each triangle. Subdivision cannot correct an image's pixel-to-coordinate mapping when it differs from the declared source CRS.
- Great-circle paths are not supported by `GreatCircleLayer` or `ArcLayer` with `greatCircle: true`. They fall back to ordinary arcs between projected endpoints, as with `greatCircle: false`. To preserve a great-circle path, sample it in geographic coordinates and render the samples with `PathLayer`.
- `LineLayer`, `ArcLayer`, `PathLayer` and `SolidPolygonLayer` ignore `wrapLongitude` when the layer uses CPU preprojection or its source coordinates are not WGS84. Split geometry at the desired longitude boundary before passing it to these layers.
- With `coordinateSystem: 'default'`, layer positions are interpreted as coordinates in WGS84. `modelMatrix` and then `coordinateOrigin` are applied in the source CRS before conversion. Use a CRS identifier or PROJ string to declare another source CRS. Positions whose CRS signature matches the view's descriptor bypass CPU conversion. Legacy `coordinateSystem: 'cartesian'` also bypasses conversion. Cartesian positions are in target CRS units in `crs`, and `modelMatrix` and `coordinateOrigin` both apply.
- Split geometry at projection discontinuities before passing it to the layer. This view does not automatically clip geometry at those boundaries. The converter must return finite coordinates for the geometry you render.
- Picked coordinates are returned as world coordinates in WGS84. They may be unavailable where the descriptor’s inverse converter cannot return a valid position.

## Source

[modules/core/src/views/custom-projection-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/custom-projection-view.ts)
