# RFC - Multi Viewports

* **Author**: Ib Green
* **Date**: August 10, 2017
* **Status**: **Implemented**

Notes:
* This functionality is being revised in the new `View Class RFC`.
* In particular, ideas about "viewport descriptors" that were suggested as a next step have now been developed further and moved to the separate `View Class RFC`.
* This RFC started out as an extension of an initial left/right viewport prototype for WebVR integration made by Xiaoji Chen.


## Overview

This RFC proposes
* Multi Viewport Support - extending `DeckGL.viewports`
* Layer Filtering - a mechanism to only include layers in certain viewports
* Viewport - extend current `width,height` with `x,y` Positioning in top left (CSS) coordinates
* Child Component Autolayouting - Support for positioning background maps, viewport labels etc.


## Motivation

It is common in 3D applications to render a 3D scene multiple times, with different cameras:
* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering, where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).


## Problem Statement

* In v4.1, deck.gl creates a canvas and allows only a single viewport that always renders in the top-left corner of that canvas.
* deck.gl is limited to rendering into a single canvas, due to the one-to-one relation between a canvas and a `WebGLRenderingContext`.
* to efficiently render multiple views, we need to carve up the canvas using `gl.viewport`.
* We need a system to describe the different viewports (x,y,width,height) and what should be rendered in them.


## Proposed Features

### Multi Viewport Support

Use the current `Viewport` class hierarchy, but allow the application to add multiple viewports.

### Layer Filtering

Add a new callback `layerFilter` (see docs) enabling app to not render certain layers in specific viewports. Just an initial simple mechanism to make sure that the app has some control, it can be refined in future releases.


### Viewport x,y Positioning

Specifying x,y coordinates in the viewport is a small addition to the current set of parameters which already includes width and height.

Viewport dimensions will be specified in top left (CSS) coordinates. CSS coordinates are more natural as the rest of the UI layout with other HTML components etc is done in this coordinate system.

> x,y will only be used for positioning (unproject). This is something that could be reconsidered.

> `gl.viewport` uses bottom-left and normal CSS layout uses top left. Translating between the two is surprisingly fiddly since both y coordinates and heights need to be stacked and device pixel ration has to be considered, so it is best to hide this translation "under the hood".


### Viewport ids

Giving viewport ids enables them to be referenced in filtering and child autolayouting.

This means that viewport without backing components or other special features will not need a `id`.


### Child Component Autolayouting

> TODO: Autolayouting functionality currently only supported in the deck.gl React library.

Child autolayouting is intended to render labels, or base maps (or other React components) underneath DeckGL viewports.

Since deck.gl is WebGL based, all its viewports need to be in the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact)

`Deck` takes a`views` prop and positions any children with `viewId` prop matching the a viewport id under that viewport.  (`viewports` is intended to be the same array passed to the `DeckGL` componentcontaining a possibly mixed array of `Viewports` and "viewport descriptors" ).


#### Support for positioning background maps

For map backed viewports, some assistance in positioning maps correctly under the viewports would be nice. It requires some fiddling with CSS properties, a method that read the viewport descriptors and rendered map components?

react-map-gl provides a `StaticMap` that is a perfect backdrop for `WebMercatorViewports`. In deck.gl v4.1 the maps and the main viewport take up a 100% of the viewport, so aligning the two are trivial.

In fact, the DeckGL component is usually set to a child of the MapGL component. When using multiple base maps, this obviously won't work.

The suggestion is to supply a new React component that walks the viewport descriptor list and looks for some attributes and renders base map components (absolutely positioned in CSS) in the same place as the deck.gl viewport will appear in the overlay.


### Related Topics

Related topics, not addressed in this RFC

### Picking
* Picking - should picking also render all viewports? Probably yes.
* Should the pickInfo object contain a viewport reference? Probably not.
* Push multi viewport rendering into LayerManager / draw-and-pick.js


### About Layer Update Costs in Multi-View Setups

The Layer life cycle supports updateState being called when a viewport changes (in addition to when props or data change), so that a layer can do JavaScript calculations using the updated viewport.

updateState({changeFlags: viewportChanged})

When rendering with many viewports there is a concern that updateState gets called many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers).  It feels like a perf hit for an edge scenario (though of course still cheaper than maintaining two deck.gl instances in this case).

An important mitigation is that while viewports change very frequently, few layers actually need to update state based on viewport. Because of this `shouldUpdateState` was subtly changed in deck.gl 4.1. It now only returns true when props or data changed, but not when viewports change. So layers that want updateState to be called when viewports change (like ScreenGridLayer) now need to redefine shouldUpdateState. This will mean that even though all layer’s will have shouldUpdateState called every viewport every frame, at least only a few will get calls to updateState.


## API Proposals

For examples, see Usage section below.

### Proposed: `DeckGL.views` New Property

Allows the main `DeckGL` component to accept a list of Viewports (and/or viewport descriptors). This will deprecated the current `viewport` prop.

Notes:
* `DeckGL` component should stil create a default viewport from props if none were supplied. Basic apps can still avoid dealing with `Viewport`s.
* `flattenArray` Call on the views prop, just like we do on the `layers`, to support nested arrays.


### Proposed: `DeckGL.viewport` Deprecate in favor of `DeckGL.views`.


### Proposed: New `DeckGL.children` Property
* `children` - Normally the DeckGL component is the last child is intentionally rendered on top.
* `views` - A singe viewport, or an array of `Viewport`s or "Viewport Descriptors". Will walk the list looking for viewport ids matching children viewIds, rendering those components in the position and size specified by that viewport. Positioning is done with CSS styling on a wrapper div, sizing by width and height properties. Also injects the `visible: viewport.isMapSynched()` prop.


### Proposed: New `DeckGL.layerFilter` Property


### Proposed: New `Viewport.x` and `Viewport.y` Properties


### Proposed: New `Viewport.id` Property


## Usage

Viewports can be side-by-side (top and bottom in this first example). Note how the application controls both the height and the y position of the two viewports.
```js
  <DeckGL viewports=[
    new FirstPersonViewport({...viewprops, height: viewprops.height / 2}),
    new WebMercatorViewport({...viewprops, y: viewprops.height / 2, height: viewprops.height / 2}),
    ...
  ]/>
```

Side-by-side is of course essential for stereoscopic rendering (and conveniently, the base deck.gl viewport can directly accept view and projection matrices from the WebVR API):
```js
  <DeckGL viewports=[
    // left eye viewport
    new Viewport({
      width: viewprops.width / 2,
      viewMatrix: leftViewMatrix, projectionMatrix: leftProjectionMatrix
    }),
    // right eye
    new Viewport({
      width: viewprops.width / 2, x: viewprops.width / 2
      viewMatrix: rightViewMatrix, projectionMatrix: rightProjectionMatrix
    }),
    ...
  ]/>
```

Or they can overlap, (e.g. having a small overview map in the bottom middle of the screen overlaid over the main view)
```js
  const {width, height} = viewportProps;
  ...
  <DeckGL viewports=[
    new FirstPersonViewport({...viewprops}),

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

Autolayouting Base Components
```js
  render() {
    <DeckGL
      width={viewportProps.width}
      height={viewportProps.height}
      layers={this._renderLayers()}
      viewports={[
        new FirstPersonViewport({...}),
        new WebMercatorViewport({id: 'basemap', ...})
      ]}
     >

      <StaticMap
        viewId='basemap'
        {...viewportProps}/>

    </DeckGL>
  }
```
