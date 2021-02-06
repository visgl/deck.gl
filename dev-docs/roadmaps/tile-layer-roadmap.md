# TileLayer Roadmap

* **Author**: Ib Green
* **Date**: Jan 2020
* **Status**: Draft (FOR DISCUSSION)

## Summary

This roadmap outlines directions for the deck.gl `TileLayer` from v8.1 onwards. A roadmap rather an RFC was deemed appropriate to provide guidance given the number of major requests/PRs in play.

## Background

As of deck.gl v8.0 release, the `TileLayer` has been a highly appreciated addition to deck.gl. It has been available for a couple of releases and has stabilized through a series of bug fix and improvement PRs and is already quite usable.

However light usage of the layer quickly discovers that a number of things are lacking.
- key features like caching, request scheduling and additive parent-child refinements have now been added to the `Tile3DLayer` but are missing in the similar but simpler 2D `TileLayer`.
- A number of ambitious user PRs proposing to extend the `TileLayer` in new directions show how important this layer is to deck.gl users. Without a clear roadmap it is hard to provide guidance on and accept these PRs in a timely way.
- ...


## Goals and Aspirations

To be able to provide fair and consistent feedback on the ambitious PRs and feature requests being opened on the `TileLayer`, it is important to define what the layer is supposed to be and not to be.

Goals
- High performance tile loading
- Flexibility to support various tile format
- ...

Non-goals
- The `TileLayer` is NOT indended to be a full replacement for a base map (e.g. a mapbox base map) as that involves a long tail of features to achieve the required level of polish).

## Current Issues

### Known Issues with v8.0 Tile Layer

- BUG: Parent tiles are not hidden - When opacity != 1 overlapping child/parent tiles are visible
- Tile caching scheme is naive
- No request scheduling - tiles no longer in view (e.g. after quick pans) can still be loaded, request queue floods with "low priority" tile requests starving other loading, ...
- No visual optimizations (e.g. load tiles from center out, blend in child-tiles, ...)


### PRs

At the time of writing, the following PRs were open. This roadmap tries to understand what these PRs want to achieve, then proposes a number of improvements to the `TileLayer`, then contains recommendations for these PRs in light of the proposals:

- [`MVTTileLayer`](https://github.com/uber/deck.gl/pull/3935) - Highlights: Mapbox vector tile support - Worker loading of mapbox vector tiles - Better/Customized Tile Cache - Composite Geometry...
- [Non-geospatial `TileLayer`](https://github.com/uber/deck.gl/pull/4117) - Provide the necessary hooks in to control coordinate mapping to tiles  `tileSize`, `tile2boundingBox`, `getTileIndices`,
- [TerrainLayer](https://github.com/uber/deck.gl/pull/3984) - An example of `TileLayer` used to display terrain. Something we want to make easy (at least easier) for users.

## Proposals

### Proposal: Breakout out `TileLayer` tile handling into `Tileset2D` class.

- Would follow conventions/established pattern in `Tileset3D` in loaders.gl, making it easier for a maintainer to work on both layers.
- Move `Tileset2D` to loaders.gl (easier maintenance)?
- Use same API across `Tileset2D` and `Tileset3D`, e.g. for setting viewStates
- Users who need to configure tile loading would not need to subclass the entire layer, just the `Tileset2D` class.

### Proposal: data prop set to `Tileset` class

- Current layer with callback functions is not `data` based like other layers and makes it hard to e.g. switch tileset.

### Proposal: Implement a smart tile cache

- Need a proper tile cache (high water mark etc)
- Share with Tileset3D? Move to `@loaders.gl/loader-utils`?
- Needs to be configurable?

### Proposal: Add `RequestScheduler` support to `Tileset2D`

- Ability to cancel non-issued requests, Avoid requesting tiles that are no longer in view.
- Ability for user to override request order? (external user feature request).

### Proposal: Better tile request order

- Request missing tiles intelligently (e.g. spiral from center out).

### Proposal: New `@loaders.gl/mvt` modules for Mapbox Vector tiles

- Makes MVTLoader a pluggable loader, no different from other tiles
- Leverage the worker thread support in loaders.gl (keeping deck.gl and TileLayer clean from such overhead)
- Would be a member of the geospatial loader category (i.e. can output GeoJSON).

### Proposal: Support all deck.gl coordinate systems

Also see `3DTileLayer` with `potree` examples - Often non-geospatial.

### Proposal: Implement proper tile replacement

- Simple mode: Show parent tiles until all child tiles loaded (must be done whenever opacity != 1)
- Advanced mode: Blend child tiles into parent tiles?

## Way forward for Open PRs

To help providing feedback in the PRs themselves, it may help discuss how they fit into the TileLayer roadmap.

### PR [`MVTTileLayer`](https://github.com/uber/deck.gl/pull/3935)

Proposed feedback:
- Worker Thread loading of [MVT](https://github.com/mapbox/vector-tile-js) (mapbox vector tiles) - Remove, and build/use new `@loaders.gl/mvt` (or `@loaders.gl/mapbox-vector-tile`) module.
- Tile Cache - Generalize and put in core TileLayer (or possibly share TileCache with `Tileset3D` in loaders.gl)
- Composite Geometry - do not merge, keep this on application side, just make sure `TileLayer` offers necessary hooks that app needs.

### PR [Non-geospatial `TileLayer`](https://github.com/uber/deck.gl/pull/4117)

Proposed feedback:
- Do not create a separate base class
- Provide the necessary hooks in the standard `TileLayer` (or `Tileset2D` class) to control coordinate mapping to tiles
   - `tileSize`,
   - `tile2boundingBox`,
   - `getTileIndices`,
- Add test data! TileLayer is likely going to be heavily refactored over the next two years and deck.gl is unlikely to be able to keep non-geospatial support working without tests and examples.

### PR [TerrainLayer WIP](https://github.com/uber/deck.gl/pull/3984)

This PR is just an example of how the existing TileLayer can be used to do new things, so no direct concerns need to be addressed.
- Look at the example and see if any simplifications could be done by improving the TileLayer API.
- We could potentially offer some utilities for image data loading and terrain generation - TBD, see WIP work on image data loading in loaders.gl.
