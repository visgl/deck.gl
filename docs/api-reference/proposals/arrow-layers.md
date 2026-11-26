# Arrow layers

## Overview

Private deck.gl layers backed by the Arrow adapters and `GPUVector` objects from
`@luma.gl/engine/arrow`.

The layers intentionally do not use deck.gl `AttributeManager` for Arrow columns.
Arrow data is converted once into `GPUVector`/`GPUTable` inputs and bound directly
to luma.gl models.

## GPUVector-first core family

Icon and Scatterplot follow a two-level contract:

1. `@deck.gl/proposals/layers` renders aligned, batched, caller-owned GPUVectors.
2. This package resolves Arrow columns, uploads adapter-owned GPUVectors, and releases them when the
   Arrow layer changes or finalizes.

```ts
import {ArrowScatterplotLayer} from '@deck.gl/proposals/layers';

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
linestring, polygon, or multipolygon children from field extension metadata. Encoded and mixed
geometry uses the GeoJSON renderer and picking returns the source Arrow row.
Polygon extrusion, outlines, and extensions also use the standard GeoJSON renderer.
Set `getElevation` to a constant or a source column for extruded polygons.

To load a GeoJSON file directly, pass its URL and `GeoJSONLoader`. The loader converts the file to
an Arrow table with a GeoArrow geometry column. Set
`loadOptions: {geoarrow: {encodingPreference: 'optimized'}}` to request native coordinate buffers
when the input contains a single geometry type.

If the table has multiple geometry columns, set `getGeometry` to the field name, for example
`getGeometry: 'footprint'`. The layer uses the declared primary geometry when available,
then the first field with GeoArrow extension metadata.
To render multiple geometry columns, pass the same table to several layers with different
`getGeometry` values.
A layer `query` can also project or alias a geometry field. Select the alias with `getGeometry`
if the projected table still has multiple geometry columns.

To render a derived geometry per source row, pass a SQL accessor such as
`getGeometry: {sql: 'ST_PointOnSurface(footprint)'}`. Supply spatial functions with
`sqlFunctions: POSTGIS_SPATIAL_FUNCTIONS` from `@math.gl/geospatial/st-functions`.
Styling and picking refer to the source rows. The
[spatial SQL example](https://github.com/visgl/deck.gl/tree/master/examples-v10/proposals/geoarrow-sql)
shows centroid, interior point, and envelope expressions.

```ts
import {GeoArrowLayer} from '@deck.gl/proposals/layers';
import {GeoJSONLoader} from '@loaders.gl/tables/geojson';

new GeoArrowLayer({
  id: 'boundaries',
  data: '/data/boundaries.geojson',
  loaders: [GeoJSONLoader],
  getFillColor: [93, 138, 82, 255],
  pickable: true
});
```

These Arrow layers intentionally accept only Arrow sources. Classic JavaScript arrays and legacy binary
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

The graph explorer example’s local `GraphExplorerEffect` composes topology, vertex degree, PageRank, weak components, deterministic
communities, neighborhood search, and progressive force layout inside deck.gl's existing frame.
Deck owns queue submission; the effect retains original source and target edge partitions,
including empty batches, without staging or reading graph data back to the CPU.

```ts
import {GPUGraphEdgeLayer, GPUGraphNodeLayer} from '@deck.gl/proposals/layers';
import {GraphExplorerEffect, type GraphExplorerDataset} from './graph-explorer-effect';

const dataset: GraphExplorerDataset = {
  vertexCount,
  sourceChunks,
  targetChunks,
  positions,
  velocities
};
const effect = new GraphExplorerEffect(device, dataset);
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
const sampledEffect = new GraphExplorerEffect(device, dataset, {
  layoutMode: 'sampled',
  addSampledLayoutToGraph: addApplicationOwnedSampledLayout
});
```

`addApplicationOwnedSampledLayout(commandGraph, layout)` declares application-owned GPU work on
the supplied graph and existing layout; it does not transfer ownership or add an example
dependency to this package. Omitting the optional configuration retains the regular exact-layout
constructor shown above.

The graph explorer uses algorithms from `@luma.gl/graph/gpu-graph-algorithms`. Its diagnostics report resident populations, visible edge
detail, CPU encoding, and frame cadence without inventing GPU timings or claiming convergence for
a fixed iteration budget.

## Development in deck.gl

Source snapshot: `visgl/luma.gl@23eb0f713e1f66dc8cf6c9b73aefbd740309de92`.

This private package was copied from luma.gl's `modules/proposals`. Its package name
is unchanged. It uses the local deck.gl core workspace and luma.gl 10 prereleases.
Run `yarn build-private` and `yarn lint` from the repository root. Run
`yarn test-private` for the module node and headless suites. The regular build and
tests exclude these private prototypes. The copied examples and integration tests live in this repository.
Gallery-specific assertions were adapted to the standalone example metadata.

luma.gl alpha.6 publishes the required integrations, including Arrow and text under
`@luma.gl/engine`. A regular workspace install supplies these dependencies.

Apache Arrow is also a peer dependency (`>=17.0.0`), so applications and the luma.gl
adapter share the same Arrow types. Supply it in the consuming workspace. The deck.gl
workspace already receives Arrow through its loaders.gl dependencies.

## Examples and integration tests

The original standalone examples and their shared fixtures are available in
[`examples-v10/proposals`](https://github.com/visgl/deck.gl/tree/master/examples-v10/proposals). Run `yarn build-private-examples`
after installing workspace dependencies. `yarn test-private` includes the copied
example integration tests alongside the module tests.
