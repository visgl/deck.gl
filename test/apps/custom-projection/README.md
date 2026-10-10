# Custom projection test app

From the repository root, run `yarn`, then:

```sh
cd test/apps/custom-projection
yarn start-local
```

The app uses `@math.gl/projection` to supply the view's forward/inverse callbacks.
Projection execution remains outside deck.gl core.

The experimental `_CustomProjectionView` accepts a stable converter object.
Map meters in `toCrs` are normalized to common space by the fixed scale
`512 / 40075016.6855`. The app uses this shared scale for all projections rather
than fitting each to its extent.
`resolution` is in world-coordinate units (degrees here). View state uses `center` in `fromCrs`,
`pitch`, and `bearing`; navigation locks center Z to zero. Meter scale is estimated
locally. The optional `getDistanceScale(positionInToCrs)` returns
real-world meters per unit along the axes of `toCrs`, including local distortion.
The converter's Z is preserved by preprojection and scaled during rendering.

The stereographic definition supplies
`toBounds` to cover its larger map-meter extent for local size sampling.

The controller has an independent planar view state. Rotation gestures and keyboard
navigation follow MapController: dragging upward increases pitch. Pan and zoom
anchors stay on the common-space z=0 plane; the inverse projection converts the new center back to `fromCrs`.
Optional controller `maxBounds` are expressed in world coordinates (`fromCrs`).
Their projected envelope constrains the unrotated map footprint.

Picking and viewport unproject return world coordinates;
viewport project accepts world coordinates.

The projection selector offers Web Mercator, Equal Earth, equirectangular, and
north-polar stereographic. Mercator clamps latitude to ±85.05°; stereographic clamps
at 60°S to avoid its south-pole singularity. Equirectangular clamps latitude to
±89.999999° to keep coordinates just inside the poles. Projections may extend beyond
the default common-space square; zoom out to see their larger extents.
Selecting a projection restores its initial framing; stereographic centers on
the North Pole. The Reset view widget restores that framing after navigation.

The app and projection helpers are TypeScript. After building the local core/layers/widgets
packages, typecheck the demo from the repository root with:

```sh
yarn tsc -p test/apps/custom-projection/tsconfig.json
```

Projection converters are passed directly to the view. `fromBounds` specifies
input-space XY clamping before projection and after valid inverse projection;
Z is preserved. This clamps coordinates rather than clipping geometry. Out-of-range
picking returns a boundary coordinate when the converter has a valid inverse;
invalid inverses still return null.
