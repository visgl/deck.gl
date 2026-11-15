# Proposals

The private `@deck.gl/proposals` module contains experimental APIs available from a deck.gl source checkout. Build the module with `yarn build-private`.

* [Tile2DLayer](https://deck.gl/next/docs/api-reference/proposals/tile-2d-layer.md) renders tiled data and can share loaded content across layers and views.
* [MVT2DLayer](https://deck.gl/next/docs/api-reference/proposals/mvt-2d-layer.md) adds vector tile decoding and rendering.
* [Tileset2D](https://deck.gl/next/docs/api-reference/proposals/tileset-2d.md) manages shared tile loading and caching. Its entries are [Tile2DHeader](https://deck.gl/next/docs/api-reference/proposals/tile-2d-header.md) objects.

See the guides for [layer entry points](https://deck.gl/next/docs/api-reference/proposals/layers.md), [Arrow layers](https://deck.gl/next/docs/api-reference/proposals/arrow-layers.md), [GPU layers](https://deck.gl/next/docs/api-reference/proposals/gpu-layers.md), and [effects](https://deck.gl/next/docs/api-reference/proposals/effects.md).
