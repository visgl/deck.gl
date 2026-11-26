# deck.gl proposals examples

These examples and their shared fixtures were copied from `luma.gl/examples/deck`
alongside the prototypes now consolidated in the private `@deck.gl/proposals` package.
Layers use `@deck.gl/proposals/layers`. The graph explorer owns its effect.
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
yarn --cwd examples-v10/proposals/arrow-path-layer start
# Run the private module tests (including example integration tests):
yarn test-private
```

The examples prefer WebGPU where available. Individual examples declare backend
requirements in `mobile-support.ts`; `gpu-graph-explorer` requires WebGPU.
Private examples and tests remain opt-in.
Visual smoke scripts beside the examples use Playwright and can be run with Node.
The website embeds these examples under **Arrow Layers - deck.gl v10**,
and **GPU Graph Layers - deck.gl v10**.
`yarn test-website` builds their assets using the installed luma.gl packages. `yarn --cwd website start` also builds the
embedded demos before starting the website. Their controls and device selectors
remain available inside each example page.

## Examples

- [arrow-path-layer](./arrow-path-layer/)
- [arrow-polygon-layer](./arrow-polygon-layer/)
- [arrow-text-layer](./arrow-text-layer/)
- [gpu-culled-trace](./gpu-culled-trace/)
- [gpu-graph-explorer](./gpu-graph-explorer/)
- [luspatial-taxi](./luspatial-taxi/)
- [shared-tile-2d-layer](./shared-tile-2d-layer/)

## Visual effects in deck.gl-community

- [weather](https://visgl.github.io/deck.gl-community/examples/layers/weather)
- [soft-shadows](https://visgl.github.io/deck.gl-community/examples/layers/soft-shadows)
- [city-scene](https://visgl.github.io/deck.gl-community/examples/layers/city-scene)
- [flow-particles](https://visgl.github.io/deck.gl-community/examples/layers/flow-particles)
- [point-glow](https://visgl.github.io/deck.gl-community/examples/layers/point-glow)
- [fireflies](https://visgl.github.io/deck.gl-community/examples/layers/fireflies)
- [hdr-night-lighting](https://visgl.github.io/deck.gl-community/examples/layers/hdr-night-lighting)
- [global-illumination](https://visgl.github.io/deck.gl-community/examples/layers/global-illumination)
- [light-shafts](https://visgl.github.io/deck.gl-community/examples/layers/light-shafts)
- [ambient-occlusion](https://visgl.github.io/deck.gl-community/examples/experimental/ambient-occlusion)
- [depth-of-field](https://visgl.github.io/deck.gl-community/examples/layers/depth-of-field)
- [scene-buffers](https://visgl.github.io/deck.gl-community/examples/layers/scene-buffers)
- [pattern-fills](https://visgl.github.io/deck.gl-community/examples/layers/pattern-fills)
- [styled-paths](https://visgl.github.io/deck.gl-community/examples/layers/styled-paths)
- [globe-clouds](https://visgl.github.io/deck.gl-community/examples/layers/globe-clouds)
- [sketch-edges](https://visgl.github.io/deck.gl-community/examples/layers/sketch-edges)
