# Aggregation graph operations

These internal semantic operations use only luma APIs. They are kept here until they
can be upstreamed to `@luma.gl/graph`:

- `GPUGroupAggregationOperation`: dense unsigned keys, optional row mask, and
  count/sum/min/max/mean statistics. Weighted inputs use finite float32 contributions.
- `GPUReductionOperation`: float32 sum/min/max/extent, with an optional row mask.
- `aggregationOperationLowerings`: register these with `GPUGraphCompiler`.

Outputs must be declared with their format and size. Group outputs and reduction
outputs currently require a single packed chunk. Inputs use the underlying luma
primitives' supported layouts and chunking. Operations borrow their inputs and
outputs; compiled command graphs own their scratch resources.

ScreenGrid's projection and bin assignment remain in `screen-grid-layer/screen-grid-graph.ts`.
`GraphScreenGridAggregator` owns its output vectors and lifecycle. The graph path uses
GPU-resident keys and contributions and returns the existing GPUVector results.
It is selected explicitly through the layer's `aggregator` prop. The default backend is unchanged.
The graph aggregator does not yet support shader extensions.
