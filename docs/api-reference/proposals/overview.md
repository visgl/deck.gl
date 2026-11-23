# Proposals

The private `@deck.gl/proposals` module contains experimental APIs available from a deck.gl source checkout. Build the module with `yarn build-private`.

- [Tile2DLayer](./tile-2d-layer.md) renders tiled data and can share loaded content across layers and views.
- [MVT2DLayer](./mvt-2d-layer.md) adds vector tile decoding and rendering.
- [Tileset2D](./tileset-2d.md) manages shared tile loading and caching. Its entries are [Tile2DHeader](./tile-2d-header.md) objects.

See the guides for [layer entry points](./layers.md), [Arrow layers](./arrow-layers.md), [GPU layers](./gpu-layers.md), and [effects](./effects.md).
