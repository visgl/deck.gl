# Gaussian splats: Coit Tower

This experimental example renders the public 50.9-million-splat Coit RAD scene with the same
quality-critical architecture as the luma.gl showcase. `RADSource` range-loads independently
decoded pages, `SplatRADHierarchyManager` continuously selects a camera-dependent row frontier,
and `GPUPagedSplatRenderer` retains float colors and spherical harmonics while applying one exact
global GPU depth order across all active pages.

During camera interaction, the renderer immediately reprojects the retained coherent frontier but
does not synchronously retarget and republish it for every raw pointer event. When interaction
settles, `SplatRADHierarchyManager` retargets the retained tree instead of restarting traversal from
the roots. Existing visible leaves stay selected until their branch is re-evaluated for the changed
camera, so a bounded update cannot replace fine detail with a handful of coarse ancestors. Newly
visible siblings refine into the same tree without mixing a parent with its descendants.

Already active page loads continue during the gesture. The residency window has a 15-million-splat
steady minimum and temporarily adds 5 million splats of transition headroom so incoming pages can
load without evicting the still-visible frontier. Current-view requests are reprioritized as soon as
interaction settles. The window then shrinks to the larger of that minimum or the exact intact-page
footprint of the current frontier. A stable screen-center fovea and larger stationary traversal
slice resolve the center without putting hierarchy publication on the interaction path.

The earlier proof flattened every selected page into one Arrow table before handing it to a
tile-local renderer. That bridge discarded non-DC spherical harmonics, clamped HDR color to eight
bits, and replaced global ordering with per-tile sorting. Increasing the page count could not
restore the missing renderer invariants, so this reference deliberately keeps pages intact.

## Run

Install dependencies in both the deck.gl root and this example directory. Until the retained-camera
retargeting prerequisite is released by luma.gl, `LUMA_GL_ROOT` must point to a local luma.gl
checkout containing that change. `LOADERS_GL_ROOT` remains an optional override for the published
loaders.gl dependency:

```bash
yarn
cd examples/experimental/gaussian-splats
yarn
LUMA_GL_ROOT=/path/to/luma.gl yarn start-local
```

The example requires a browser and adapter with WebGPU support. Once a luma.gl release includes the
retained-camera retargeting behavior, the package pin and run instructions can return to the
published dependency.

## Ownership boundary

- `@loaders.gl/splats` range-loads and decodes native Spark RAD pages.
- `SplatRADHierarchyManager` owns camera-driven row selection, fallback continuity, and residency.
- `GPUPagedSplatRenderer` owns sparse projection, global GPU ordering, and float/SH presentation.
- The browser shell owns camera interaction, transition residency, and active/resident page
  diagnostics.

This is the visual-parity reference for a future deck.gl/Tile3D integration. Such an integration
must feed intact pages and sparse active-row masks into the paged renderer; flattening them into a
`SplatLayer` table is not a quality-preserving adapter.
