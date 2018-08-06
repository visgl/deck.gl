# RFC - View Class Enhancement

* **Author**: Ib Green
* **Date**: August, 2018
* **Status**: **Draft**

References:
* [View Class RFC](../v5.2/view-class-rfc.md) for deck.gl v5.


## Summary

This RFC proposes to extend the functionality of the recently added `View` classes along the lines that were suggested as future extensions in the original proposal, to supporting things such as advance controls of view state (selection and filtering), layer filtering, support for overlapping viewports through background clearing and scissoring, and advanced render parameters.


## Motivation

The new `View` descriptor classes were introduced partly because they provide a highly extensible API for the future.


## Requirements

* Support for overlapping views (clearing background, scissoring)
* More control over viewState selection and filtering
* More control over layer filtering
* More control over rendering setup/teardown (onBeforeRender, onAfterRender callbacks)
* More control over advanced rendering aspects


### Marking Pitch (deck.gl What's New Page)

* **Multiview Support** - deck.gl's multiview support has been significantly enhanced. New `View` features give applications more control over rendering, making it possible to implement overlapping views, and simplifying implementation provide partially synchronized views, views that display different layer sets etc.


## Proposed Documentation Additions


### New `View` Class Properties


##### `layerFilter` : Function | String[] | `null`

Restricts what layers will be rendererd in this view.

* `Function`: function will be called with the following arguments: `layerFilter({layer, view, isPicking})`
* `Array`: array of layer ids. Layer id's will be matched from with initial substring of layer ids, allowing nested layers to be matched.
* `null` (default): All layers will be rendered.


##### `viewStateId` : String | null

Used to select a specific view state (necessary if the viewState id is different than the view's id).


##### `viewStateFilter` : Function | Object | `null`

Allows the View to modify a view state before using it. Useful in multiview situations where it enables having one view that fixes some parameters (eg. zoom, pitch and bearing to show an overview map).

* `Function`: will be called with `viewStateFilter(viewState)`. if it returns a value, it will be used as the modified viewState.
* `Object`: will be merged with viewState and override any supplied fields.
* `null`: the selected `viewState`


##### `clear`: ...

TODO - align argument with luma.gl `clear` function. Should allow for specification of `color` etc. Assuming we don't need
* `color` - Background color
* `onClear({gl, view, viewport, ...})` - Customize what is cleared (color, depth, stencil etc)


##### `onBeforeRender({gl, view, viewport, viewState,...})`

If supplied, called on every render, just before this view is rendered. However, note that a view that does not intersect the current update rect may not be rendered during that render frame, in which case the callback will not be called.


##### `onAfterRender({gl, view, viewport, viewState,...})`

If supplied, called on every render, just after this view was rendered. Note that a view that does not intersect the current update rect may not be rendered during that render frame, in which case the callback will not be called.



## New Properties that Need More Study


##### `parameters`

Enables the application to provide a full set of GL parameters, perhaps most importantly, selecting framebuffer. Note that 

* `framebuffer` - makes this view render into a framebuffer
* `parameters`: {blendMode, ...}


##### `framebuffer` : `Framebuffer` | `null`

* Rendering to offscreen framebuffers

If supplied, controls which framebuffer will be the default render target for the layers rendered in this view. Enables vertain views to be rendered to offscreen framebuffers.

TODO: investigate implications
* relative viewport sizes will be resolved against the framebuffer size.
* viewports with framebuffers will not be involved in picking.
* ...


## More Advanced Features

We could address use cases beyond simply rendering multiple views:
More ambitous extensions:
* Each descriptor can provide its own layer and effects lists...
* Multiple render passes over the same viewport - avoid clearing background

A viewport descriptor could specify additional information like:
* a named renderbuffer from a previous stage (viewport descriptor) to be used as input for effects, stencil buffering etc.
* a `context object` with parameters that get passed to property animation functions.
