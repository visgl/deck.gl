# Private deck.gl examples

These examples and their shared fixtures were copied from `luma.gl/examples/deck`
alongside `@deck.gl-community/gpu-layers` and `@deck.gl-community/arrow-layers`.
They use this repository's deck.gl source and the root dependency installation.

## Setup and commands

Run `yarn` at the repository root, then link the unpublished luma.gl peers as
explained in [GPU layers](../../modules/deck-gpu-layers/README.md) and
[Arrow layers](../../modules/deck-arrow-layers/README.md). Do not install dependencies
inside the example directories. Their package manifests provide commands using the
root installation; the examples are intentionally outside the package workspaces.

```sh
# From the repository root:
yarn build-private
yarn build-private-examples
# Or build selected examples:
yarn build-private-examples arrow-path-layer gpu-graph-explorer
# Start an example:
yarn --cwd examples/deck/arrow-path-layer start
# Run the private module tests (including example integration tests):
yarn test-private
```

The examples prefer WebGPU where available. Individual examples declare backend
requirements in `mobile-support.ts`; `gpu-graph-explorer` requires WebGPU.
Private examples and tests remain opt-in because their luma.gl peers are unpublished.
Visual smoke scripts beside the examples use Playwright and can be run with Node.
These standalone examples are not registered in the public deck.gl website gallery.

## Examples

- [ambient-occlusion](./ambient-occlusion/)
- [arrow-path-layer](./arrow-path-layer/)
- [arrow-polygon-layer](./arrow-polygon-layer/)
- [arrow-text-layer](./arrow-text-layer/)
- [city-scene](./city-scene/)
- [depth-of-field](./depth-of-field/)
- [fireflies](./fireflies/)
- [flow-particles](./flow-particles/)
- [global-illumination](./global-illumination/)
- [globe-clouds](./globe-clouds/)
- [gpu-culled-trace](./gpu-culled-trace/)
- [gpu-graph-explorer](./gpu-graph-explorer/)
- [hdr-night-lighting](./hdr-night-lighting/)
- [light-shafts](./light-shafts/)
- [luspatial-taxi](./luspatial-taxi/)
- [pattern-fills](./pattern-fills/)
- [point-glow](./point-glow/)
- [scene-buffers](./scene-buffers/)
- [sketch-edges](./sketch-edges/)
- [soft-shadows](./soft-shadows/)
- [styled-paths](./styled-paths/)
- [weather](./weather/)

## Current validation limits

All 22 examples build and pass the shared TypeScript check. The opt-in browser
suite currently has five failures: two scene-capture cases, firefly picking,
meter-offset projection, and the restored graph rendering pipeline timeout.
The styled-paths visual smoke script also fails its WebGPU route-picking assertion.
These tests remain enabled in the private suite; the public CI suite excludes
private prototypes until their unpublished peers and integration issues are resolved.
