# Proposals

The single private workspace for experimental deck.gl layers and effects. This
package is not published and is not a dependency of public deck.gl modules.

- `@deck.gl/proposals/layers`: GPU-resident, Arrow, atmospheric, and particle layers.
- `@deck.gl/proposals/layers/path-layer`, `/polygon-layer`, `/solid-polygon-layer`,
  and `/text-layer`: focused GPU layer entry points.
- `@deck.gl/proposals/effects`: scene buffers, shader passes, and GPU graph effects.
- `@deck.gl/proposals/effects/query`: geographic query effects and diagnostics.

Implementations live in `src/layers` and `src/effects`; tests mirror that structure.
Add new prototypes here instead of creating more private packages. The build checks
that `proposals` is the only private package under `modules`.

Run `yarn build-private`, `yarn test-private`, and `yarn build-private-examples`
from the repository root to validate these prototypes and their examples.

See [GPU layers](../../docs/api-reference/proposals/gpu-layers.md), [Arrow layers](../../docs/api-reference/proposals/arrow-layers.md),
and [focused layer entry points](../../docs/api-reference/proposals/layers.md) for API details.

### GPU path and polygon layers

These layers borrow prepared GPU vectors on WebGPU. Keep the vectors and their buffers
alive while a layer uses them, and release them after the layer is done.

- `StoragePathLayer` takes variable-length `paths`, optional `colors` and `widths`, and
  optional per-vertex `timestamps`. It also accepts Arrow path columns and batch
  sources on WebGL and WebGPU through the Arrow renderer. For prepared GPU vectors,
  repeat the first vertex to close a path. Stroke
  width defaults to pixels and supports scaling and pixel clamps. Use
  `jointRounded`, `capRounded`, and `antialiasing` to control stroke coverage.
  Set `billboard: false` to extrude in the path plane.
- `StorageSolidPolygonLayer` takes tessellated `positions`, per-vertex feature IDs in
  `rowIndices`, triangle `indices`, and optional `fillColors`. The index buffer needs
  index usage. Tessellate holes before uploading the mesh.
- `StoragePolygonLayer` accepts either prepared `polygonMeshes` (positions, triangle
  indices, and feature row indices) or raw Arrow `polygons`. The layer tessellates raw
  rings asynchronously and retains the previous mesh while preparing its replacement.
  GPU ring vectors require `allowPolygonReadback` to tessellate on the CPU. Supply
  outline `paths` separately, with optional `lineColors` and `lineWidths`. When outline
  row indexes differ from fill feature IDs, pass `pathFeatureIds` with one feature ID
  per outline row. Deck picking then returns the same index for the fill and its
  outlines.

These proposals cover WebGPU strokes and flat fills. Extrusion, wireframe, and
extension parity are outside this scope.
