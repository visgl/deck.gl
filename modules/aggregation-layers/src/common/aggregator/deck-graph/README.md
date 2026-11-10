# Deck aggregation graph operations

`DeckAggregationInputsOperation` evaluates layer input shader hooks as an ordinary
GPUGraph render node. It reads dense per-point bin keys and borrowed layer attributes,
and writes packed float32 contributions plus a uint32 selection mask. Assignment
clears the selection mask on every invocation, so discarded fragments stay excluded.

The lowering declares buffer accesses and a graph-owned one-pixel color attachment.
Shader models belong to the compiled node; attributes belong to the layer. Uniform
and attribute changes are supplied through `AggregationShaderContext`. Changing
buffer identities or layouts rebuilds the graph's resource declarations.

This operation stays in deck because it uses deck geometry and extension hooks.
The independent math operations in `gpu-graph/` remain candidates for luma upstreaming.
