# Custom projection test app

From the repository root, run `yarn`, then:

```sh
cd test/apps/custom-projection
yarn start-local
```

Countries and airports use the same remote Natural Earth GeoJSON URLs as the
get-started examples. The graticule is generated locally. All three use GeoJsonLayer.
The app uses proj4js's built-in Equal Earth projection (EPSG:8857), which supplies
the view's forward/inverse callbacks. Core does not depend on proj4js.

The experimental `_CustomProjectionView` requires output bounds and accepts a stable converter object.
Bounds establish normalization, not clipping. `resolution` is in input units (degrees
here). View state uses a common-space `center`, `pitch`, and
`bearing`. Z is fixed at zero for navigation. Meter scale is estimated
by the viewport at the center using `inputUnits: 'degrees'`, while altitude
normalization is independent of camera position. `getUnitsPerMeter` remains an
optional override for custom scale calculations.

The controller has an independent planar view state. Rotation gestures and keyboard
navigation follow MapController: dragging upward increases pitch. Pan and zoom
anchors stay on the common-space z=0 plane and do not call the inverse projection.
Optional controller `maxBounds` are expressed in common space and constrain the
unrotated map footprint; they do not use OrbitController's spherical bounds.

Position transforms ignore layer coordinateSystem/coordinateOrigin and consume
modelMatrix before projection. Picking returns input coordinates; viewport
project/unproject operate on common coordinates. Increment projectionId if a converter
changes internally. Camera changes do not invalidate projected positions.

Initial support covers ScatterplotLayer, PathLayer, PolygonLayer/SolidPolygonLayer,
and the corresponding GeoJsonLayer sublayers. Binary position inputs, projection
seam clipping, great-circle arcs, and sharing a layer between different projections
are unsupported. Recreate the layer with a new ID when switching between ordinary
and preprojecting viewports. GPU preprojection and batch transforms are deferred
to a future iteration.

The projection selector offers Web Mercator, Equal Earth, equirectangular, and
north-polar stereographic. Mercator clamps latitude to ±85.05°; stereographic clamps
at 60°S to avoid its south-pole singularity. Equirectangular clamps latitude to
±89.999999° to keep coordinates just inside the poles. Each projection has fixed output bounds.
All three layers share a spring geometry transition. Tessellation topology can
change between projections, so polygon morphs may have transient artifacts.

The app and projection helpers are TypeScript. After building the local core/layers
packages, typecheck the demo from the repository root with:

```sh
yarn tsc -p test/apps/custom-projection/tsconfig.json
```

Projection converters are passed directly to the view. `inputBounds` specifies
input-space XY clamping before projection and after valid inverse projection;
Z is preserved. This clamps coordinates rather than clipping geometry. Out-of-range
picking returns a boundary coordinate when the converter has a valid inverse;
invalid inverses still return null. Changing input bounds invalidates geometry.
