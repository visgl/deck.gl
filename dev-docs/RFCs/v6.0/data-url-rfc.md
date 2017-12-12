# RFC: dataUrl Layer property

* **Authors**: Xiaoji Chen and Ib Green
* **Date**: Aug 2017
* **Status**: Initial draft, not ready for review

Notes:
* Broken out from the [Off-thread Attribute Generation RFC]().


# Motivation

deck.gl makes it incredibly easy to visualize big data, just instantiate a layer with a `data` prop pointing to your data, and supply a few simple accessors to describe the structure of your data, and you are done.

However, the user still needs to load the data in the first place before he or she can pass it to the layer. Depending on a users skill level, this can be anything from a minor 5-minute routine exercise, to a multi-day knock-out blow (learning about requests and XHR, installing and tinkering with npm modules, figuring out how to deal with an async loading in Redux, etc).

This RFC makes the proposal that we allow deck.gl layers to be instantiated directly with URLs (and optionally when required some additional request options such as headers, CORS flags etc), and deck.gl will then handle the async loading on behalf of the user, automatically displaying the data when loaded.


## Proposed Implementation

* **Request function** - Hard to make one request function that fits all cases, can we:
* Make the request function replacable
* Use built-in (luma-gl's) request function as default to avoid duplicating code?

* Request parameters - Often special headers and options must be set on the request for it to succeed. How should these be supplied? Especially if we want to support different request modules?

* Data transformation - If the raw data is not an array that maps 1-to-1 with layer geometries (which is, most of the time), pre-processing is necessary before passing it into the data prop. Offering a prop that allows the user to specify a transformation function could extend the applicability of the `dataUrl` prop to more use cases.


### Layer class API changes

| Prop | Current | Proposed |
| --- | --- | --- |
| `dataUrl` or `dataRequest` | - |  URL String or request options |
| `dataConverter` |  - | Function that receives the value of data and returns an Array or Object. Default to IDENTITY. |


### Layer life cycle changes

* If a layer’s `dataRequest` prop is specified, when it changes, LayerManager creates a one-time Promise that downloads it. Mark the layer’s life cycle as `PENDING_LOAD` and skip rendering.
* Transform the result with dataConverter.
* Use the transformed result instead of the data prop of the layer, and initialize it.


## Open Issues?

* Where to implement - inside `AttributeManager`?
* Changing the URL, while loading data
* updateTriggers - should not be an issue
* New prop (`dataUrl`) vs overloading `data` to handle strings as URLs?
* Node vs Browser


