# Aggregation graph operations

These internal semantic operations use only luma APIs. They are kept here until they
can be upstreamed to `@luma.gl/graph`:

- `GPUGroupAggregationOperation`: dense unsigned keys, optional row mask, and
  count/sum/min/max/mean statistics. Weighted inputs use float32.
- `GPUReductionOperation`: float32 sum/min/max/extent, with an optional row mask.
- `aggregationOperationLowerings`: register these with `GPUGraphCompiler`.

Outputs must be declared with their format and size. Group outputs and reduction
outputs currently require a single packed chunk. Inputs use the underlying luma
primitives' supported layouts and chunking. Operations borrow their inputs and
outputs; compiled command graphs own their scratch resources.

ScreenGrid's projection, bin assignment, output formatting, and lifecycle remain in
`webgpu-aggregator/graph-aggregation.ts` and the layer adapter. The graph path uses
GPU-resident keys and contributions and returns the existing GPUVector results.
Extension shader hooks continue through the shared shader reducer.
