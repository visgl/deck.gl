# Experimental deck.gl v10 examples

These examples and their shared fixtures were copied from `luma.gl/examples/deck`
alongside the prototypes now consolidated in the private `@deck.gl/proposals` package.
Layers use `@deck.gl/proposals/layers`; effects use `@deck.gl/proposals/effects`.
They use this repository's deck.gl source and the root dependency installation.
Shared UI helpers live in `shared/`, Arrow fixtures in `shared/arrow/`,
and showcase fixtures in `shared/showcase/`.

## Setup and commands

Run `yarn` at the repository root to install the published luma.gl dependencies.
Do not install dependencies inside the example directories. Their package manifests provide commands using the
root installation; the examples are intentionally outside the package workspaces.

```sh
# From the repository root:
yarn build-private
yarn build-private-examples
# Or build selected examples:
yarn build-private-examples arrow-path-layer gpu-graph-explorer
# Start an example:
yarn --cwd examples/v10-experimental/arrow-path-layer start
# Run the private module tests (including example integration tests):
yarn test-private
```

The examples prefer WebGPU where available. Individual examples declare backend
requirements in `mobile-support.ts`; `gpu-graph-explorer` requires WebGPU.
Private examples and tests remain opt-in.
Visual smoke scripts beside the examples use Playwright and can be run with Node.
The website embeds these examples under **Arrow Layers - deck.gl v10**,
**Visual Effects - deck.gl v10**, and **GPU Graph Layers - deck.gl v10**.
`yarn test-website` builds their assets using the installed luma.gl packages. `yarn --cwd website start` also builds the
embedded demos before starting the website. Their controls and device selectors
remain available inside each example page.

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
The styled-paths and city-scene visual smoke scripts also fail their WebGPU
route-picking and roof-picking assertions, respectively.
These tests remain enabled in the opt-in private suite; public test jobs exclude
them. The website build bundles the demos using the published luma.gl packages.
