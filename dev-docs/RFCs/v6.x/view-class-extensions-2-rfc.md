# RFC - View Class Extensions 2

* **Author**: Ib Green
* **Date**: August, 2018
* **Status**: **Draft**

References:
* [View Class RFC](../v6.1/view-class-extension-rfc.md) for deck.gl v5.
* [View Class RFC](../v5.2/view-class-rfc.md) for deck.gl v5.


## Summary

This RFC proposes to extend the functionality of `View` class hinted at in the original `View` proposal, such as advanced render parameters.


## Motivation

The new `View` descriptor classes were introduced partly because they provide a highly extensible API for the future.


## Requirements

* More control over layer filtering
* More control over rendering setup/teardown (onBeforeRender, onAfterRender callbacks)
* More control over advanced rendering aspects


### Marking Pitch (deck.gl What's New Page)

TBA..


## Proposed Documentation Additions


### New `View` Class Properties


##### `layerFilter` : Function | String[] | `null`

Restricts what layers will be rendererd in this view.

* `Function`: function will be called with the following arguments: `layerFilter({layer, view, isPicking})`
* `Array`: array of layer ids. Layer id's will be matched from with initial substring of layer ids, allowing nested layers to be matched.
* `null` (default): All layers will be rendered.


##### `onBeforeRender({gl, view, viewport, viewState,...})`

If supplied, called on every render, just before this view is rendered. However, note that a view that does not intersect the current update rect may not be rendered during that render frame, in which case the callback will not be called.


##### `onAfterRender({gl, view, viewport, viewState,...})`

If supplied, called on every render, just after this view was rendered. Note that a view that does not intersect the current update rect may not be rendered during that render frame, in which case the callback will not be called.


##### `parameters`

Enables the application to provide a full set of GL parameters, perhaps most importantly, selecting framebuffer.

* `framebuffer` - makes this view render into a framebuffer
* `parameters`: {blendMode, ...}


##### `framebuffer` : `Framebuffer` | `null`

* Rendering to offscreen framebuffers

If supplied, controls which framebuffer will be the default render target for the layers rendered in this view. Enables vertain views to be rendered to offscreen framebuffers.

TODO: investigate implications
* relative viewport sizes will be resolved against the framebuffer size.
* viewports with framebuffers will not be involved in picking.
* ...


### More Advanced Features

We could address use cases beyond simply rendering multiple views:
More ambitous extensions:
* Each descriptor can provide its own layer and effects lists...
* Multiple render passes over the same viewport - avoid clearing background

A viewport descriptor could specify additional information like:
* a named renderbuffer from a previous stage (viewport descriptor) to be used as input for effects, stencil buffering etc.
* a `context object` with parameters that get passed to property animation functions.
