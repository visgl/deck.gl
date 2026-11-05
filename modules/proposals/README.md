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

See [GPU layers](./layers-GPU-LAYERS.md), [Arrow layers](./layers-ARROW-LAYERS.md),
and [focused layer entry points](./layers-README.md) for API details.

### GPU path and polygon layers

These WebGPU layers borrow prepared GPU vectors. Keep the vectors and their buffers
alive while a layer uses them, and release them after the layer is done.

- `GPUPathLayer` takes variable-length `paths`, optional `colors` and `widths`, and
  optional per-vertex `timestamps`. To close a path, repeat its first vertex. Stroke
  width defaults to pixels and supports scaling and pixel clamps. Use
  `jointRounded`, `capRounded`, and `antialiasing` to control stroke coverage.
  Set `billboard: false` to extrude in the path plane.
- `GPUSolidPolygonLayer` takes tessellated `positions`, per-vertex feature IDs in
  `rowIndices`, triangle `indices`, and optional `fillColors`. The index buffer needs
  index usage. Tessellate holes before uploading the mesh.
- `GPUPolygonLayer` adds outline `paths`, `lineColors`, and `lineWidths`. When outline
  row indexes differ from fill feature IDs, pass `pathFeatureIds` with one feature ID
  per outline row. Deck picking then returns the same index for the fill and its
  outlines.

These proposals cover WebGPU strokes and flat fills. Extrusion, wireframe, and
extension parity are outside this scope.
