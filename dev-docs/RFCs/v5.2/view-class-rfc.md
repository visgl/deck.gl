# RFC - View Classes for deck.gl

* **Author**: Ib Green
* **Date**: January 5, 2018
* **Status**: **Implemented**

References:
* [Multi Viewport RFC](../v5.0/multi-viewport-rfc.md) for deck.gl v5.
* [First Person Geospatial Viewport RFC](../v5.0/first-person-geospatial-viewport-rfc.md) for deck.gl v5.
* [Infovis Viewport RFC](../v4.0/non-geospatial-viewports-rfc.md) for deck.gl v4.


## Overview

This RFC proposed a new `View` class that takes over the role of "viewport descriptor" from the current `Viewport` class. This reduces the heavy overload of `Viewport` and provides a highly extensible API for the future.


## Motivation

deck.gl v5.0 implements powerful multi-view feature however the API is still "experimental" due to a consensus that API is not final and needs further discussion and revision.

This RFC proposes a new `View` class API for specifying multi-viewport configurations that solves a number of issues with the existing API. It is intended to represent a big step towards an official multi-view(port) API in deck.gl.


### Problem Statements

Issues related to using `Viewport`s as "view descriptors"
* `Viewport` property overload - Separation of concerns: jamming all new description options into the base `Viewport` class, adds a lot of complexity to an already quite complex class.
 - Viewport are already highly complex classes that are designed to do one thing well: Hybrid geospatial/infovis projection. Using them as generic "view" descriptors means that an increasing number of non-projection related properties are being added.
* Autoresizing: `Viewport` classes are static/immutable - Viewports are designed for efficient projection/unprojection. This makes them somewhat unsuitable to be descriptors for "views" as they have to be recreated every time the deck.gl container size (canvas size) changes.

Issues related to the `Viewport` class hierarchy being the main API for selecting type of view:
* `Viewport` class hierarcy - Settling on a consistent, simple to explain Viewport class hierarchy has been difficult since info vis and hybrid geospatial apps value different aspects (e.g. type of projection matrix vs type of view matrix).

Issues related to future support for multiple (per-view) `Controller`s:
* There is a desire to be able to specify different controllers on different viewports. Adding a `controller` field to the current `viewport` seems like unacceptable coupling between two complex class hierarchies.

The detailed multi controller proposal is in a separate RFC, however the `View` class becomes a natural anchor point to specify what `Controller` works with what `View`.


## Requirements

Primary Requirements
* **Autosize** - ability to specify viewport x,y,width,height as relative (percentages).
* **Layer Filtering** - Select what layers to show in a viewport
* **Per View Callbacks** - onBeforeRender and onAfterRender
* **View Aware Picking** - picking infos should include information about what view was used, coordinates should make sense within that view as well as within the canvas.

Secondary Requirements:
* **Controller/View Association** - Needs Discussion, but a `View` class could be a natural place to specify any necessary parameters.


## Feature Proposals

* Proposed: New `View` ES6 Class

* Viewport Autosizing: Relative Positions and Dimensions - Ability to specify viewport `x`, `y`, `width`, `height` as relative values (percentages) in addition to numbers.



## What's New

### New `View` Class

A descriptor for one view (window or viewport) into your date. Contains `id`, `type` (WebMercatorViewport etc), relative size (`x`, `y`, `width`, `height`).


### DeckGL can displays Multiple Views

A new `views` property lets the `DeckGL` component to render multiple views of your based on a list of `View` "descriptors".

* Support `flattenArray`, it will allow a single `View` or nested `View` array to be passed to `views`.


## Upgrade Guide

### DeckGL Class

##### Changed `DeckGL.layerFilter` property

Change signature `layerFilter({layer, view, isPicking})` instead of `layerFilter({layer, viewport, isPicking})`

We could still provide the derived viewport instance, but it may no longer have the `id` property the app most likely is looking for.


| Old Method            | New Method        | Comment |
| ---                   | ---               | ---     |
| `viewports`         | `views`      | `viewports` was an experimental prop |
| `viewport`          | `views`      | |


#### Viewport Class

| Old Method            | New Method        | Comment |
| ---                   | ---               | ---     |
| `id`         | N/A      | Removed |
| `x`          | N/A      | TBD - keep and use as offset in projections? |
| `y`          | N/A      | TBD - keep and use as offset in projections? |


## View Class Docs

> Note: `View` class instances use the "CSS" (top-left, window, non-device-pixel) coordinate system to interpreset `x`,`y`, `width` and `height` properties and automatically convert to WebGL (`gl.viewport`) coordinates under the hood.

* `type` (`Viewport` subclass, default `Viewport`) - Can be any existing `Viewport` class type...
* viewport specific params?
* `id` - (String) - for filtering and child component layout
* `x` - (Number|String, default 0)
* `y` - (Number|String, default 0)
* `width` - (Number|String, default `100%`)
* `height` - (Number|String, default `100%`)
* `layerFilter({layer, view, isPicking})` - Similar to the `layerFilter` on the main DeckGL class, this filter allows control of which layers are rendered in this viewport.
* `onBeforeRender({gl, view, ...})` - called just before this view is rendered
* `onAfterRender({gl, view, ...})` - called just before this view is rendered




## Proposals that Need More Work

### Picking

Picking already renders all viewports, so an object can be picked in any viewport. But pick info is not fully updated.
* Should the pickInfo object contain a view descriptor reference?
* Should relative coordinates be resolved within viewports?
* Ability to restrict picking to certain viewport?


### View Parameter Decoupling

In this discussion, view parameter refer to a controller/viewport specific set of parameters that describe the "current viewpoint" for a specific controller/view pair. It can be lng/lat/zoom for a web mercator viewport, or rotationX/rotationY for an orbit controller.

While we can absolutely add view parameters to the View class, it is desirable to decouple "view parameters" from "view descriptors" since all other properties of view descriptors change very rarely, if at all.

## Impact Analysis

| Area           | Impact |
| ---            | --- |
| updateTriggers | No impact identified |
| transitions    | No impact identified |


## Ideas

* Viewport: Support for x, y - Should we be able to unproject coordinates in a viewport from a position on the canvas? If so, we may need to add x,y support to Viewport unproject.


## Extensibility

> Note: The purpose of this section is to show that in contrast to `Viewport`, the `View` class can support considerable functional API extensions in a natural way. The actual features are not considered part of this RFC and may need to be approved in a separate RFC before implementation.

### Controller

Specify per viewport controller (see separate RFC).


### Advanced Render Parameters

Viewports and multi-view functionality is likely to keep evolving and an important aspect is that this proposal should allow for future feature growth in a natural way.

Therefore this section lists ideas of new functionality that could be elegantly "absorbed" by the View descriptor class.

Ideas:
* `color` - Background color
* `onClear({gl, view, viewport, ...})` - Customize what is cleared (color, depth, stencil etc)
* `framebuffer` - makes this view render into a framebuffer
* `parameters`: {blendMode, ...}

We could address use cases beyond simply rendering multiple views:
* Multiple render passes over the same viewport - avoid clearing background
* Rendering to offscreen framebuffers

A viewport descriptor could specify additional information like:
* a list of layer ids, causing the rendering into that viewport to only cover the listed layers.
* a named renderbuffer from a previous stage (viewport descriptor) to be used as input for effects, stencil buffering etc.
* a `context object` with parameters that get passed to property animation functions.

More ambitous extensions:
* Each descriptor can provide its own layer and effects lists...


## Usage

These are API examples to show how the new class would be used in applications

### Autosizing Layouts (Percentage Sizes)

`View`s can be laid out top-to-bottom as in this example. Note how the application controls both the height and the y position of the two viewports.
```js
  <DeckGL views=[
    new View({type: FirstPersonViewport, viewprops, height: '50%'}),
    new View({type: WebMercatorViewport, viewprops, y: '50%', height: '50%'}),
    ...
  ]/>
```

Side-by-side `View`s is of course essential for stereoscopic rendering (and conveniently, `View`'s can directly accept view and projection matrices from the WebVR API):
```js
  <DeckGL views=[
    // left eye
    new View({ // type defaults to `Viewport`
      width: '50%',
      viewMatrix: leftViewMatrix, // from WebVR API
      projectionMatrix: leftProjectionMatrix // from WebVR API
    }),
    // right eye
    new View({ // type defaults to `Viewport`
      x: '50%',
      width: '50%',
      viewMatrix: rightViewMatrix, // from WebVR API
      projectionMatrix: rightProjectionMatrix // from WebVR API
    }),
    ...
  ]/>
```

View's render in order, so they can also partially overlap, (e.g. having a small overview map in the bottom middle of the screen overlaid over the main view).
```js
  const {width, height} = viewportProps;
  ...
  <DeckGL views=[
    new View({
      type: FirstPersonViewport,
      ...viewprops
    }),

    // Render a small map viewport over the main first person viewport
    new WebMercatorViewport({
      ...viewprops,
      height: height / 8,
      width: width / 8,
      x: width * 7 / 16,
      y: height * 13 / 16
    })
  ]/>
```

And of course Views can also fully overlap.

> TODO - in this case the application will need to control how background is cleared, likely clearing depth and stencil buffers but not color buffer for the second view.

```js
  const {width, height} = viewportProps;
  ...
  <DeckGL views=[
    new View({
      type: FirstPersonViewport,
      ...viewprops
    }),

    // Render a small map viewport over the main first person viewport
    new View({
      type: WebMercatorViewport({
      ...viewprops
    })
  ]/>
```

### Autolayouting Base Components

```js
  render() {
    <DeckGL
      width={viewportProps.width}
      height={viewportProps.height}
      layers={this._renderLayers()}
      views={[
        new View({type: FirstPersonViewport, ...}),
        new View({type: WebMercatorViewport, id: 'basemap', ...})
      ]}
     >

      <StaticMap
        viewId='basemap'
        {...viewportProps}/>

    </DeckGL>
  }
```


### Open - Separated View Parameters

In the React API, views could be created once and just passed in on each render.
```js
const views = [...];

render() {
  <DeckGL
    views={views}
    viewStates={{firstPerson: viewState1, map: viewState2}}
}
```

In the JS API, the views could be set just once.
```js
  const deck = new Deck();
  deck.setViews(views);

  onViewStateChanged(...) {
    deck.setViewStates(viewStates);
  }
```
