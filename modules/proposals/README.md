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
