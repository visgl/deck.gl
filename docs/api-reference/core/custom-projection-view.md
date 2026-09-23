# CustomProjectionView (Experimental)

`CustomProjectionView` renders a planar map using application-supplied coordinate conversion functions. Positions are converted on the CPU into a stable common space before rendering. It uses [CustomProjectionViewport](./custom-projection-viewport.md) and [CustomProjectionController](./custom-projection-controller.md).

This API is experimental and may change. Import it as `_CustomProjectionView` from `@deck.gl/core` or `deck.gl`.

## Usage

```js
import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

// An equirectangular map: input and output XY are longitude/latitude in degrees.
const projection = {
  forward: position => position.slice(),
  inverse: position => position.slice()
};

new Deck({
  views: new CustomProjectionView({
    projection,
    inputBounds: [-180, -90, 180, 90],
    outputBounds: [-180, -90, 180, 90],
    inputUnits: 'degrees',
    controller: true
  }),
  initialViewState: {target: [256, 256, 0], zoom: 1},
  layers: [new ScatterplotLayer({
    data: [{position: [-122.4, 37.8]}],
    getPosition: d => d.position,
    getRadius: 20000
  })]
});
```

The converter may come from a projection library; deck.gl does not bundle one. Retain the converter object between renders. Its identity is part of the projection signature, so replacing it triggers position recalculation.

## Constructor

Inherits [View options](./view.md#constructor), including layout, padding, controller settings and GPU parameters. Additional options:

| Option | Default | Description |
| --- | --- | --- |
| `projection` | Required | `{forward, inverse}` conversion functions. See the [coordinate contract](./custom-projection-viewport.md#coordinate-contract). |
| `outputBounds` | Required | `[minX, minY, maxX, maxY]` in converter output units. Defines normalization into common space. |
| `inputBounds` | None | `[minX, minY, maxX, maxY]` in input coordinates. Clamps XY before forward conversion and after a valid inverse. |
| `projectionId` | None | String or number to change when a converter changes internally without changing identity. |
| `resolution` | `5` | Maximum subdivision cell size in input-coordinate units for paths and polygons. Smaller values improve curved-edge approximation and increase CPU work and vertex counts. |
| `zScale` | `1` | Multiplier applied to output Z before normalization. |
| `inputUnits` | None | `'degrees'` or `'meters'` for local meter-scale estimation. If omitted, output XY units are assumed to be meters. |
| `getUnitsPerMeter` | None | `(inputPosition) => [x, y, z]` in converter output units per meter; overrides the estimate. |
| `orthographic` | `false` | Use an orthographic camera instead of perspective. |

## View State

| Property | Default | Description |
| --- | --- | --- |
| `target` | `[256, 256, 0]` | Camera center in normalized common coordinates, not longitude/latitude. Navigation locks Z to zero. |
| `zoom` | `0` | Each increment doubles the scale. |
| `pitch` | `0` | Map pitch in degrees, as in `MapView`. |
| `bearing` | `0` | Map bearing in degrees, as in `MapView`. |
| `minZoom`, `maxZoom` | `-Infinity`, `Infinity` | Zoom constraints; controller bounds may impose an additional minimum. |
| `minPitch`, `maxPitch` | `0`, `85` | Pitch constraints, clamped to the range 0–85 degrees. |

To center on an input position, use the viewport's `preproject(position)` result as `target`. Camera changes do not change the normalized positions. Changes to the converter, bounds, `projectionId`, `resolution` or `zScale` invalidate the projection signature and rebuild position attributes.

TypeScript configuration types are exported as `CustomProjectionViewProps`, `CustomProjectionViewState`, `CustomProjectionViewportOptions` and `CustomProjection`. Like the classes, these types are experimental.

## Controller

Enable interaction with `controller: true`. The default [CustomProjectionController](./custom-projection-controller.md) pans and zooms in common space, with map-style pitch and bearing controls. Its default bounds are the common-space square `[[0, 0], [512, 512]]`; use `controller: {maxBounds: null}` to allow unrestricted panning.

## Limitations

- Preprojection is currently wired into `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`, including their use by `PolygonLayer` and the corresponding `GeoJsonLayer` sublayers. Other layers are not automatically compatible.
- Preprojected layers interpret accessor coordinates through the converter rather than `coordinateSystem` or `coordinateOrigin`. `modelMatrix` is applied before conversion.
- Keep a layer's preprojection capability fixed for its lifetime. Use separate layer IDs when switching between ordinary and preprojected views.
- Paths and polygons subdivide in input space before projection. The converter must produce finite coordinates for rendered geometry; arbitrary seams, interrupted projections and singularities are not automatically clipped.
- A local scale estimate controls meter-sized styling. A fixed `zScale` is not automatically a latitude-dependent Mercator altitude conversion; supply Z conversion in the converter when needed.
- Picking applies the inverse converter and reports input coordinates, or no coordinate outside the valid inverse domain. Viewport navigation works in common space even without a valid inverse.

## Source

[modules/core/src/views/custom-projection-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/custom-projection-view.ts)
