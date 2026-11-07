# Proposed layers

Private home for experimental GPU-resident, Arrow, atmospheric, and particle layers. Import these from `@deck.gl/proposals/layers`; the following focused GPU layer entry points remain available.

- `@deck.gl/proposals/layers/path-layer`: `StoragePathLayer`
- `@deck.gl/proposals/layers/polygon-layer`: `StoragePolygonLayer`
- `@deck.gl/proposals/layers/solid-polygon-layer`: `StorageSolidPolygonLayer`
- `@deck.gl/proposals/layers/text-layer`: `StorageTextLayer`

Inputs are borrowed. Paths use storage buffers; polygon fills currently use vertex attributes. Text rendering depends on the supplied luma.gl text strategy.

Each subpath also exports `GPUVectorLayerPickingInfo` for the picking provenance exposed by these layers.
The former private GPU and Arrow packages are consolidated here. Effects now live in `@deck.gl/proposals/effects`. See [GPU layers](./gpu-layers.md) and [Arrow layers](./arrow-layers.md) for the experimental APIs.
