# RFC - View Class Enhancement

* **Author**: Ib Green
* **Date**: August, 2018
* **Status**: **Implemented**

References:
* [View Class RFC](../v5.2/view-class-rfc.md) for deck.gl v5.


## Summary

This RFC proposes to extend the functionality of `View` class hinted at in the original `View` proposal, primarily to support overlapping viewports through background clearing and scissoring and improved control of view state (selection and "filtering").

<div align="center">
  <div>
    <img src="https://raw.github.com/visgl/deck.gl-data/master/images/docs/minimap.gif" />
    <p><i>PoC: Minimap implemented declaratively using the enhanced View Class API</i></p>
  </div>
</div>


## Motivation

The new `View` descriptor classes were introduced partly because they provide a highly extensible API for the future.


## Requirements

* Support for overlapping views (clearing background, scissoring)
* More control over viewState selection and filtering


### Marking Pitch (deck.gl What's New Page)

* **Multiview Support** - deck.gl's multiview support has been significantly enhanced. New `View` features give applications more control over rendering, making it possible to implement overlapping views, and simplifying implementation provide partially synchronized views, views that display different layer sets etc.


## Proposed Documentation Additions

### New `View` Class Properties


##### `viewState` : String | Object | null

Used to specify what view state that should be used by this `View` when rendering, picking or projecting coordinates.

The `viewState` property, while optional, enables a number of use cases:

* Sharing view states between multiple views - If a `View` id is different from the designed view state's id.
* specify a complete, constant (fixed) view state directly in the view
* Overriding a partial set of view state properties from a selected view state.

* `null` (default): Will select a view state based on `view.id`, falling back to using the first view state.
* `String`: Will attempt to match the indicated 	view state.
* `Object` (with `id` field): if the object contains an `id` field which matches a dynamic view state, the remaining fields will extend the specified dynamic view state.
* `Object` (with no `id` field): If no `id` is provided, the `View.viewState` object will be used directly as the view state, essentially representing a fixed or constant view state.

Note that specifying both `id` and `viewState` effectively allows the View to modify a view state before using it. This is useful in multiview situations where it enables having one view that fixes some parameters (eg. zoom, pitch and bearing to show an overview map).

TBD impact on controller? Can the controller make sense of what view state properties it can/should update when properties are overridden?



##### `clear`: Boolean | Object

Clears the contents (pixels) of the viewport. If `true` clears color and depth buffers.

* `color` (Boolean or Array) - if not `false`, clears all active color buffers with either the provided color or the currently set clear color.
* `depth` (Boolean)  - if `true`, clears the depth buffer.
* `stencil` (Boolean) - if `true` clears the stencil buffer.

Note that the screen is cleared before each render, and viewports should only clear if they are e.g. rendering on top of another viewport, want to change the background coloer etc. Clearing, while cheap, is not totally free.


* The value of the `View.clear` property is used as argument to the luma.gl `clear` function:
* The view's scissor box bounds the cleared region.
* The pixel ownership test, the scissor test, dithering, and the buffer writemasks affect the operation of `clear`.
* Alpha function, blend function, logical operation, stenciling, texture mapping, and depth-buffering are ignored by `clear`.



## Future Extensions

See separate [RFC: View Class Extensions 2]().
