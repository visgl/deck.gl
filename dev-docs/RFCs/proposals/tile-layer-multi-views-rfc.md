# RFC: Texture-based Descriptive Attributes

* Authors: Ib Green, ...
* Date: May, 2021
* Status: **Draft**

## References
- PR #5758

## Summary

This RFC proposes improvements to 
- Use a single `Tile3DLayer` in multiple `Views` without triggering reloads and other overhead. 
- Use a single `Tileset3D` in multiple `Tile3DLayer`s (by passing in a `Tileset3D` instance as a prop instead of a URL)

## Background

Loading multiple copies of the same I3S or 3D tiles is costly, both in load + parse time, and also in terms of memory pressure.

Being able to have multiple `Tile3DLayer`s and multiple `View`s within each Tile3DLayer share a single Tileset3D instance efficiently is important for a number of use cases.

## Problem 1

The `Tileset3D` class in loaders.gl is being updated to support multiple views (effectively "view frustums" keyed by ids). 

The idea is that a single `Tileset3D` class will load all tiles defined by the intersection of all registered view frustums (which could be multiple views from a single `Tile3DLayer` layer, or even multiple views from multiple `Tile3DLayer`s).

The goal is that changes to `Tile3DLayer` should be fairly limited and involve registering and deregistering views from `layer.context.viewports` on the `Tileset3D` class, and requesting tiles by viewport Id when rendering.

If this works well, it could be a good "blueprint" for other tile manager classes, such a Tileset2D.

## Problem 2

Currently we rely on the `Tileset2D`/`Tileset3D` classes to perform frustum culling. We then use `renderSubLayers()` to generate sub layers for the visible tiles.

Since sub layer generation can not (should not) be performed on every draw or view change, we end up with a list of layers that cover all views. 

This leads to unnecessary rendering of tiles outside of view (some perf impact)

## Proposal: Implement optional layer culling in deck.gl

If we allow a layer to (optionally) specify its bounding volume, we could do a visibility check against the current view frustum before we call draw on a layer. Such pre-draw culling is standard functionality in any traditional 3D framework. 

We would support a standard interface supported by the `@math.gl/culling` primitives (`BoundingSphere`, `AxisAlignedBoundingBox`, `OrientedBoundingBox`).

We would gain a lot of generality by adding this support (we could now start generating bounding boxes for many layers) there is some duplicated culling work done in the Tileset classes and during draws. 

The optional layer culling thus even be implemented directly in luma.gl `Model` and handled by `Model.draw()`

## Proposal: Allow `visible` prop to be a function

As discussed in draft PR. Powerful but opens up the API in potentially undesirable ways.

## Proposal: Allow `visible` prop to be a list of view ids

More declarative, in that no callbacks are required. Can be supported in deck.gl JSON, pydeck etc.

## Proposal: Add a new `cull` prop

To avoid overloading the `visible` prop we could add a new, more special purpose prop.
Could be a function or list of view ids, or a user supplied bounding volume.
