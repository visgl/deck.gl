# @deck.gl-community/arrow-layers

## Overview

Private deck.gl layers backed by the Arrow adapters and `GPUVector` objects from
`@luma.gl/arrow`.

The layers intentionally do not use deck.gl `AttributeManager` for Arrow columns.
Arrow data is converted once into `GPUVector`/`GPUTable` inputs and bound directly
to luma.gl models.

## GPUVector-first core family

Arc, Column, GridCell, Icon, Line, PointCloud, and Scatterplot follow a two-level contract:

1. `@deck.gl-community/gpu-layers` renders aligned, batched, caller-owned GPUVectors.
2. This package resolves Arrow columns, uploads adapter-owned GPUVectors, and releases them when the
   Arrow layer changes or finalizes.

```ts
import {ArrowScatterplotLayer} from '@deck.gl-community/arrow-layers';

const layer = new ArrowScatterplotLayer({
  id: 'arrow-points',
  data: arrowTable,
  getPosition: 'geometry',
  getRadius: 'radius',
  getFillColor: 'color'
});
```

The adapter preserves Arrow record-batch boundaries. Constants remain constants, null-containing
columns are rejected until the caller selects an explicit replacement policy, and the GPU layer
never observes an Arrow type. Fixed-width adapters build replacement vectors before
releasing the current set; a rejected column releases partial uploads and retains the
previous vectors. Path streams close their iterators when replaced, finalized, or
when batch preparation fails. `ArrowTripsLayer` similarly converts aligned timestamp lists before
delegating to the existing GPUVector path-storage model. `GeoArrowLayer` selects point,
linestring, polygon, or multipolygon children from field extension metadata without converting to
GeoJSON.

This package intentionally accepts only Arrow sources. Classic JavaScript arrays and legacy binary
attributes belong in sibling adapters rather than alternate code paths here. A future unified
deck.gl public layer may select those adapters internally while retaining the familiar layer names.

## When to use graph layers

Use the graph adapters when a deck.gl application already owns GPU-resident relationship data and
needs to visualize social networks, service dependencies, transaction communities, or citation
graphs without turning each vertex and edge into a JavaScript object.

Choose another path when a small one-off graph starts and stays on the CPU or the application
needs a graph database, automatic CPU fallback, or converged clustering guarantees. This package
adapts existing GPU results to real deck.gl layers; it does not replace the underlying graph API.

## Graph effects and layers

`GPUGraphDeckEffect` composes topology, vertex degree, PageRank, weak components, deterministic
communities, neighborhood search, and progressive force layout inside deck.gl's existing frame.
Deck owns queue submission; the effect retains original source and target edge partitions,
including empty batches, without staging or reading graph data back to the CPU.

```ts
import {
  GPUGraphDeckEffect,
  GPUGraphEdgeLayer,
  GPUGraphNodeLayer,
  type GPUGraphDeckDataset
} from '@deck.gl-community/arrow-layers';

const dataset: GPUGraphDeckDataset = {
  vertexCount,
  sourceChunks,
  targetChunks,
  positions,
  velocities
};
const effect = new GPUGraphDeckEffect(device, dataset);
```

`GPUGraphNodeLayer` consumes the exact progressive position allocation alongside resident community,
component, degree, PageRank, distance, and selection outputs. Create one `GPUGraphEdgeLayer` per
nonempty original edge partition to render caller-owned source and target buffers directly. Large
graphs can retain every real vertex while limiting only the number of displayed original edges.

Choose exact layout for small networks, the explicit uniform-grid approximation for medium-sized
networks, or inject an application-owned sampled-layout contributor for larger graphs. The sampled
contributor receives the existing command graph and force-layout objects; it is not bundled into
this private package, which never imports application or example source. The bundled showcase
keeps all 1,048,576 source vertices and 2,097,343 directed edges resident while drawing every
vertex and bounding visible edges to 65,536.

```ts
const sampledEffect = new GPUGraphDeckEffect(device, dataset, {
  layoutMode: 'sampled',
  addSampledLayoutToGraph: addApplicationOwnedSampledLayout
});
```

`addApplicationOwnedSampledLayout(commandGraph, layout)` declares application-owned GPU work on
the supplied graph and existing layout; it does not transfer ownership or add an example
dependency to this package. Omitting the optional configuration retains the regular exact-layout
constructor shown above.

The graph algorithms remain in `@luma.gl/gpgpu/gpu-graph`; only this existing private adapter
package depends on deck.gl. Its diagnostics report actual resident populations, visible edge
detail, CPU encoding, and frame cadence without inventing GPU timings or claiming convergence for
a fixed iteration budget.

## Development in deck.gl

Source snapshot: `visgl/luma.gl@23eb0f713e1f66dc8cf6c9b73aefbd740309de92`.

This private package was copied from luma.gl's `modules/deck-arrow-layers`. Its package name
is unchanged. It uses the local deck.gl core workspace and luma.gl 10 prereleases.
Run `yarn build-private` and `yarn lint` from the repository root. Run
`yarn test-private` for the module node and headless suites. The regular build and
tests exclude these prototypes because their upstream peers are unpublished. Tests coupled to examples and website infrastructure
remain in luma.gl. Example paths in this README refer to the source luma.gl repository.

The upstream `@luma.gl/arrow`, `@luma.gl/experimental`, and `@luma.gl/text` packages
are private and unavailable on npm. They are peer dependencies here. To build or run
these packages, build a compatible luma.gl checkout and link the required private
packages into deck.gl (for example, run `yarn link` in each luma.gl package, then
`yarn link @luma.gl/experimental @luma.gl/text @luma.gl/arrow` in deck.gl).
These modules require those peers at runtime; a regular install alone is insufficient.

Apache Arrow is also a peer dependency (`>=17.0.0`), so applications and the luma.gl
adapter share the same Arrow types. Supply it in the consuming workspace. The deck.gl
workspace already receives Arrow through its loaders.gl dependencies.

## Examples and integration tests

The original standalone examples and their shared fixtures are available in
[`examples/deck`](../../examples/deck/README.md). Run `yarn build-private-examples`
after linking the unpublished peers. `yarn test-private` includes the copied
example integration tests alongside the module tests.
