# WebGPU layers

WebGPU-focused counterparts of deck.gl layers for GPU-resident data. Import each layer from its named subpath.

- `@deck.gl/webgpu-layers/path-layer`: `GPUPathLayer`
- `@deck.gl/webgpu-layers/polygon-layer`: `GPUPolygonLayer`
- `@deck.gl/webgpu-layers/solid-polygon-layer`: `GPUSolidPolygonLayer`
- `@deck.gl/webgpu-layers/text-layer`: `GPUTextLayer`

Inputs are borrowed. Paths use storage buffers; polygon fills currently use vertex attributes. Text rendering depends on the supplied luma.gl text strategy.

Each subpath also exports `GPUVectorLayerPickingInfo` for the picking provenance exposed by these layers.
These layers previously lived in `@deck.gl-community/gpu-layers`; update imports to the subpaths above.
