# CustomProjectionView (Experimental)

`CustomProjectionView` renders a planar map using application-supplied coordinate conversion functions. It uses [CustomProjectionViewport](./custom-projection-viewport.md) and [CustomProjectionController](./custom-projection-controller.md).

This API is experimental and may change. Import it as `_CustomProjectionView` from `@deck.gl/core` or `deck.gl`.

## Usage

This example uses [proj4](https://github.com/proj4js/proj4js) to display city markers in the Equal Earth projection. Install it with `npm install proj4@^2.22.0` alongside deck.gl.

```js
import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import proj4 from 'proj4';

// WGS 84 longitude/latitude to Equal Earth (EPSG:8857), in meters.
const projection = proj4(
  'EPSG:4326',
  '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m'
);

// Equal Earth's full-world projected extent.
const east = projection.forward([180, 0])[0];
const north = projection.forward([0, 90])[1];

new Deck({
  views: new CustomProjectionView({
    projection,
    inputBounds: [-180, -90, 180, 90],
    outputBounds: [-east, -north, east, north],
    inputUnits: 'degrees',
    controller: true
  }),
  initialViewState: {target: [256, 256, 0], zoom: 1},
  layers: [new ScatterplotLayer({
    id: 'cities',
    data: [
      {name: 'San Francisco', position: [-122.4, 37.8]},
      {name: 'London', position: [-0.12, 51.5]},
      {name: 'Tokyo', position: [139.7, 35.7]}
    ],
    getPosition: d => d.position,
    radiusUnits: 'meters',
    getRadius: 100000,
    getFillColor: [255, 140, 0]
  })]
});
```

deck.gl does not bundle a projection library. Reuse the projection object between renders to avoid unnecessary recalculation.

## Constructor

Inherits [View options](./view.md#constructor), including layout, padding, controller settings and GPU parameters. Additional options:

| Option | Default | Description |
| --- | --- | --- |
| `projection` | Required | `{forward, inverse}` conversion functions. See the [coordinate contract](./custom-projection-viewport.md#coordinate-contract). |
| `outputBounds` | Required | The projection's output extent, expressed as `[minX, minY, maxX, maxY]` in projected coordinates. |
| `inputBounds` | None | The projection's valid input domain, expressed as `[minX, minY, maxX, maxY]` in input coordinates. |
| `projectionId` | None | Change this string or number when you change the projection's behavior without replacing the projection object. |
| `resolution` | `5` | Controls how closely paths and polygon edges follow the projection. Lower values produce smoother curves but take longer to process. Measured in input-coordinate units. |
| `inputUnits` | None | `'degrees'` or `'meters'` for local meter-scale estimation. If omitted, output XY units are assumed to be meters. |
| `getUnitsPerMeter` | None | `(inputPosition) => [x, y, z]` in converter output units per meter; overrides the estimate. |
| `orthographic` | `false` | Use an orthographic camera instead of perspective. |

Coordinates outside `inputBounds` are clamped to its boundary, not clipped. The bounds describe the projection itself; use the view state to choose the visible region.

## View State

| Property | Default | Description |
| --- | --- | --- |
| `target` | `[256, 256, 0]` | Camera center in normalized common coordinates, not longitude/latitude. Navigation locks Z to zero. |
| `zoom` | `0` | Each increment doubles the scale. |
| `pitch` | `0` | Map pitch in degrees, as in `MapView`. |
| `bearing` | `0` | Map bearing in degrees, as in `MapView`. |
| `minZoom`, `maxZoom` | `-Infinity`, `Infinity` | Zoom constraints; controller bounds may impose an additional minimum. |
| `minPitch`, `maxPitch` | `0`, `85` | Pitch constraints, clamped to the range 0–85 degrees. |

To center on an input position, such as a city's longitude/latitude, use the viewport's `preproject(position)` result as `target`.

TypeScript configuration types are exported as `CustomProjectionViewProps`, `CustomProjectionViewState`, `CustomProjectionViewportOptions` and `CustomProjection`. Like the classes, these types are experimental.

## Controller

Enable interaction with `controller: true`. The default [CustomProjectionController](./custom-projection-controller.md) pans and zooms in common space, with map-style pitch and bearing controls. Its default bounds are the common-space square `[[0, 0], [512, 512]]`; use `controller: {maxBounds: null}` to allow unrestricted panning.

## Changing Projections

You can change the projection at runtime by supplying a new `projection` object and its bounds. If you change the behavior of the existing object instead, change `projectionId` so that layers refresh their positions.

Use a new layer ID when switching a layer between `MapView` and `CustomProjectionView`. When displaying multiple views with different projections, create a separate layer instance with a unique ID for each view, and use `layerFilter` to restrict each instance to its intended view.

## Limitations

- Supported layers are `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`, including their use by `PolygonLayer` and the corresponding `GeoJsonLayer` sublayers. Other layers are not yet supported.
- Tiled layers and `WMSLayer` are not supported, including `TileLayer`, `Tile3DLayer`, `MVTLayer`, `TerrainLayer` and layers built on them.
- Meter scale is approximated at the viewport center. Meter-based sizes may not reflect distortion elsewhere in the projection.
- `coordinateSystem` and `coordinateOrigin` are ignored when a layer is used with this view. Supply positions in the coordinates expected by `projection.forward`. `modelMatrix` is applied before conversion.
- Split geometry at projection discontinuities before passing it to the layer. This view does not automatically clip geometry at those boundaries. The converter must return finite coordinates for the geometry you render.
- Picked coordinates are returned in your projection's input coordinates. They may be unavailable where `projection.inverse` cannot return a valid position.

## Source

[modules/core/src/views/custom-projection-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/custom-projection-view.ts)
