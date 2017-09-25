# RFC - Multi Viewports

* **Author**: Ib Green
* **Date**: August 10, 2017
* **Status**: **Draft**

Notes:
* This RFC started out as an extension of an initial left/right viewport prototype for WebVR integration made by Xiaoji Chen.


## Motivation

It is common in 3D applications to render a 3D scene multiple times, with different cameras:
* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering, where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).


# Problem Statement

* In v4.1, deck.gl creates a canvas and allows only a single viewport that always renders in the top-left corner of that canvas.
* deck.gl is also limited to rendering into a single canvas, due to the one-to-one relation between a canvas and a `WebGLRenderingContext` (that said it is possible to render into framebuffers that can be extracted).
In addition


## Proposal 1: New `DeckGL.viewports` property

Allows the main `DeckGL` component to accept a list of Viewports (and/or viewport descriptors). This will be in addition to, or preferably instead of, the current `viewport` prop.

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

### Viewport x,y coordinates

Specifying x,y coordinates in the viewport is a small addition to the current set of parameters which already includes width and height. Even though it will only be used for positioning (and not for calculation of intrinsic viewport parameters) it seems to make sense to include these parameters in the viewport (as opposed to the Viewport Descriptor, see below).

A downside of putting x,y in the Viewport is that it becomes tricky to use the same viewport several times in the list. One could get around this by letting x,y in the viewport descriptor override the viewport but this risks making the system too complicated, and the use case is very limited.

This means that viewport without backing components or other special features will not need a descriptor.

The biggest question is which coordinate system to use for x,y. gl.viewport uses bottom-left and normal CSS layout uses top left. Translating between the two is surprisingly fiddly since both y coordinates and heights need to be stacked (and there could be a DPR issue as well).

The proposal here is to use top left (CSS) coordinates and document it carefully. It is likely to be more natural as the rest of the UI layout with other HTML overlays is done in this coordinate system.

### Viewport Descriptors

## Proposal (Phase 2a): `DeckGL.viewport` prop can take "Viewport Descriptors"

By allowing the `viewport` prop to take "viewport descriptor" objects (in addition) we can address use cases beyond simply rendering multiple views:
* Multiple render passes over the same viewport - avoid clearing background
* Rendering to offscreen framebuffers

<DeckGL viewports=[
  {viewport: new Viewport(...), framebuffer: ...,  clear: ..., parameters: {blendMode, ...}},
  ...
]/>

* Alternative: Of course all these options could also be jammed into the base `Viewport` class, but that would add a lot of complexity to an already quite complex class, so allowing separate Viewport descriptors is preferred.


### Performance Concerns Around Layer.updateState

updateState({changeFlags: viewportChanged})

The Layer life cycle supports updateState being called when a viewport changes (in addition to when props or data change), so that a layer can do JavaScript calculations using the updated viewport.

When rendering with many viewports there is a concern that updateState gets called many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers).  It feels like a perf hit for an edge scenario (though of course still cheaper than maintaining two deck.gl instances in this case).

An important but little known mitigation is that since viewports change very frequently, but few layers actually need to handle this, shouldUpdateState was subtly changed in deck.gl 4.1. It now only returns true when props or data changed, but not when viewports change. So layers that want updateState to be called when viewports change (like ScreenGridLayer) now need to redefine shouldUpdateState. This will mean that even though all layer’s will have shouldUpdateState called every viewport every frame, at least only a few will get calls to updateState.

ACTION: The shouldUpdateState semantics are poorly documented, it would be good to have a comprehensive article about **Updates** that included this information.

### Open Questions

**Picking**
Picking - should picking also render all viewports? Probably yes.
Should the pickInfo object contain a viewport reference? Probably not.
Push multi viewport rendering into LayerManager / draw-and-pick.js

* Since our goal is to continuously reduce React dependencies it is suggested the multi-viewport rendering loop is placed outside of the `DeckGL` React component. Perhaps in an `AnimationLoop` instantiation?


MINOR
* Deprecate the current `viewport` prop? If we support `flattenArray`, it will allow a single viewport to be passed to `viewports`.
* Currently the `DeckGL` component creates a default viewport from props if none were supplied. Presumably we want to keep this for backwards compatibility, and to let basic users avoid dealing with Viewports.
* Should we call our `flattenArray` on the viewports prop, just like we do on the `layers` prop, and presumably the `effects` prop? This means the user can supply `null`s and nested arrays in the viewport list, potentilayy simplifying the generation of the list in application code.




# Proposal 2: Support for positioning background maps

For map backed viewports, some assistance in positioning maps correctly under the viewports would be nice. It requires some fiddling with CSS properties, a method that read the viewport descriptors and rendered map components?

react-map-gl provides a `StaticMap` that is a perfect backdrop for `WebMercatorViewports`. In deck.gl v4.1 the maps and the main viewport take up a 100% of the viewport, so aligning the two are trivial.

In fact, the DeckGL component is usually set to a child of the MapGL component. When using multiple base maps, this obviously won't work.

The suggestion is to supply a new React component that walks the viewport descriptor list and looks for some attributes and renders base map components (absolutely positioned in CSS) in the same place as the deck.gl viewport will appear in the overlay.


## ViewportLayout

`ViewportLayout` is a react helper component that is intended to render base maps (or other base React components underneath DeckGL viewports.

Since deck.gl is WebGL based, all its viewports need to be in the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact)

`ViewportLayout` takes a`viewports` prop and positions any children with `viewportId` prop matching the a viewport id under that viewport.  (`viewports` is intended to be the same array passed to the `DeckGL` componentcontaining a possibly mixed array of `Viewports` and "viewport descriptors" ).


## Usage

```js
  const viewports = [
    new FirstPersonViewport({...}),
    new WebMercatorViewport({id: 'basemap', ...})
  ];

  render() {
    <ViewportLayout viewports={viewports}>

      <StaticMap
        viewportId='basemap'
        {...viewportProps}/>

      <DeckGL
        width={viewportProps.width}
        height={viewportProps.height}
        viewports={viewports}
        useDevicePixelRatio={false}
        layers={this._renderLayers()} />

    </ViewportLayout>
  }
```

New Properties
* `children` - Normally the DeckGL component is the last child is intentionally rendered on top.
* `viewports` - A singe viewport, or an array of `Viewport`s or "Viewport Descriptors". Will walk the list looking for viewport ids matching children viewportIds, rendering those components in the position and size specified by that viewport. Positioning is done with CSS styling on a wrapper div, sizing by width and height properties. Also injects the `visible: viewport.isMapSynched()` prop.


```

Questions


# Appendices

These sections supply contextual information and ideas. They should not be considered a formal part of this RFC (for review / approval). That said comments are always welcome!


## Ideas

* Could we autocalculate deck.gl canvas width/height props from the viewports list? a bounding box?


## Appendix: Advanced Render Parameters

Note: This describes a possible extension to the functionality described in this proposal. It would need be detailed in a separate RFC before implemntation.

A viewport descriptor could specify additional information like:
* a list of layer ids, causing the rendering into that viewport to only cover the listed layers.
* a named renderbuffer from a previous stage (viewport descriptor) to be used as input for effects, stencil buffering etc.
* a `context object` with parameters that get passed to property animation functions.

More ambitous extensions:
* Each descriptor can provide its own layer and effects lists...


### Appendix: Controller support for Multiple Viewports


**Restrict Event Handling to match Viewport Size** - Controllers need to be able to be restricted to a certain area (in terms of event handling). Some controllers are completely general (just general drag up/down):
* When working with a map controller, especially panning and zooming, the point under the mouse represents a grab point or a reference for the operation and mapping event coordinates correctly is imporant for the experience.
* Controllers might not be designed to receive coordinates from outside their viewports.
* Basically, if the map backing one WebMercator viewport doesn't fill the entire canvas, and the application wants to use a MapControls

Controllers will also benefit from be able to feed multiple viewports of different types. There are limits to this of course, in particular it would be nice if for instance a geospatially neabled FirstPerson controller can feed both a `FirstPersonViewport` and a `WebMercatorViewport`. Various different viewports must be created from one set of parameters.

Contrast this to deck.gl v4.1, where the idea was that each the of Viewport was associated with a specific controller (WebMercatorViewport has a MapController, etc).

* **Using Multiple Controllers** An application having multiple viewports might want to use different interaction in each viewport - this has multiple complications...
* **Switching Controllers** - An application that wants to switch between Viewports might want to switch between controllers, ideally this should not require too much coding effort.
