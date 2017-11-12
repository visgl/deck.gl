# Viewports

## Visualizing Your Data using Viewports

deck.gl offers a set of viewports (essentially geospatially enabled "cameras") that can render data provided in different coordinate systems. The different [Viewport](/docs/api-reference/viewport.md) classes provide the ability to render your visualization from different perspectives (map synchronized, third person, first person, etc) and work together with various event controllers enabling the user to control the viewpoint within your visualization.

As mentioned, the basic `Viewport` class is a generic geospatially enabled version of the typical 3D "camera" class you would find in most 3D/WebGL/OpenGL library, holding `view` and `projection` matrices and other uniforms needed by the WebGL vertex shaders.

While the `Viewport` class can certainly be used directly if you need and are able to calculate your own projection matrices. it is often preferable to use a `Viewport` subclass that takes higher level parameters, such as camera position and viewing direction, or map coordinates, rather than working directly with matrices.

In addition to generating WebGL uniforms, the `Viewport` class also offers JavaScript functions to project and unproject as well as getting local distance scales.


## Overview of Viewports

| Viewport Class        | Description |
| ---                   | ---         |
| [`Viewport`](/docs/api-reference/viewport.md)            | The base viewport has to be supplied view and projection matrices. It is typically only instantiated directly if the application needs to work with viewports that have been supplied from external sources, such as the `WebVR` API. |
| [`WebMercatorViewport`](/docs/api-reference/web-mercator-viewport.md) | While all `Viewport` subclasses are geospatially enabled, this class renders from a perspective that matches a typical top-down map and is designed to synchronize perfectly with a mapbox-gl base map (even in 3D enabled perspective mode).
| [`FirstPersonViewport`](/docs/api-reference/first-person-viewport.md) | Allows the application to precisely control position and direct a `Viewport`. |
| [`ThirdPersonViewport`](/docs/api-reference/third-person-viewport.md)       | This is a "third person" `Viewport`, that looks at something from a distance and a direction. |


## About Geospatial Positioning

A special property of the `Viewport` classes that set them apart from a typical OpenGL Camera class is that it has the necessary plumbing to support non-linear Web Mercator projection.

Like many things in deck.gl, Viewports can be positioned using a lng/lat "anchor" and a meter offset. See the article about coordinate systems for more information about this setup.


### Notes on Coordinates

* For the `project`/`unproject` JavaScript functions, the default pixel coordinate system of the viewport is defined with the origin in the top left, where the positive x-axis goes right, and the positive y-axis goes down. That is, the top left corner is `[0, 0]` and the bottom right corner is `[width - 1, height - 1]`. The functions have a flag that can reverse this convention.

* Non-pixel projection matrices are obviously bottom left.
* Mercator coordinates are specified in "lng-lat" format [lng, lat, z] format (which naturally corresponds to [x, y, z]).
* Per cartographic tradition, all angles including `latitude`, `longitude`, `pitch` and `bearing` are specified in degrees, not radians.
* Longitude and latitude are specified in degrees from Greenwich meridian and the equator respectively, and altitude is specified in meters above sea level.

It is possible to query the WebMercatorViewport for a meters per pixel scale. Note that that distance scales are latitude dependent under web mercator projection (see [http://wiki.openstreetmap.org/wiki/Zoom_levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) for more details), so scaling will depend on the viewport center and any linear scale factor should only be expected to be locally correct.


## Viewport Positioning

Viewports allow the application to specify the position and extent of the viewport (i.e. the target rendering area on the screen). Viewport positions are specified in CSS coordinates (top left, non-retina, these coordinates are different from WebGL coordinates, see remarks below). It is expected that CSS coordinates are most natural to work with, as the rest of the UI layout with other HTML components is done in the CSS coordinate system.

* **x,y coordinates** - Viewports allow specification of x,y coordinates in the viewport in additin to width and height. These are only used for positioning (and not for calculation of intrinsic viewport parameters).


## Multiple Viewports

It is common in 3D applications to render a 3D scene multiple times, with different cameras:
* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering, where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).


### The `DeckGL.viewports` property

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


### Picking in Multiple Viewports

deck.gl's built in picking support extends naturally to multiple viewports. The picking process renders all viewports.

Note that the `pickInfo` object does not contain a viewport reference, so you will not be able to tell which viewport was used to pick an object.


### Positioning Background Components

One of the core features of deck.gl is to enable perfectly synchronized visualizatio overlays over other React components and DOM elements. When using a single `Viewport` this is quite easy (just make `DeckGL` canvas a child of the base component and make sure they have the same size). But when using multiple viewports, correctly positioning base components gets trickier, so deck.gl provides some assistance.

`ViewportLayout` is a react helper component that is intended to render base maps (or other base React components underneath DeckGL viewports.

`ViewportLayout` takes a`viewports` prop and positions any children with `viewportId` prop matching the a viewport id under that viewport.  (`viewports` is intended to be the same array passed to the `DeckGL` componentcontaining a possibly mixed array of `Viewports` and "viewport descriptors" ).


In this example the `StaticMap` component gets automatically position under the `WebMercatorViewport`:
```js
  const viewports = [
    new FirstPersonViewport({...}),
    new WebMercatorViewport({id: 'basemap', ...})
  ];

  render() {
    return (
      <ViewportLayout viewports={viewports}>

        <StaticMap
          viewportId='basemap'
          {...viewportProps}/>

        <DeckGL
          id="first-person"
          width={viewportProps.width}
          height={viewportProps.height}
          viewports={viewports}
          layers={this._renderLayers()} />

      </ViewportLayout>
    );
  }
```

### Multi Viewport Performance Note

When viewports change, layers can get a chance to update their state: the `updateState({changeFlags: viewportChanged})` function will be called.

When rendering with many viewports there can be a concern that updateState gets called too many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers). However, since most layers do not need to update state when viewport changes, the `updateState` function is not automatically called on viewport change. To make sure it is called, the layer needs to override `shouldUpdateState`.


### Controller Support for Multiple Viewports

TBD -

**Restrict Event Handling to match Viewport Size** - Controllers need to be able to be restricted to a certain area (in terms of event handling). Some controllers are completely general (just general drag up/down):
* When working with a map controller, especially panning and zooming, the point under the mouse represents a grab point or a reference for the operation and mapping event coordinates correctly is imporant for the experience.
* Controllers might not be designed to receive coordinates from outside their viewports.
* Basically, if the map backing one WebMercator viewport doesn't fill the entire canvas, and the application wants to use a MapController

Controllers will also benefit from be able to feed multiple viewports of different types. There are limits to this of course, in particular it would be nice if for instance a geospatially neabled FirstPerson controller can feed both a `FirstPersonViewport` and a `WebMercatorViewport`. Various different viewports must be created from one set of parameters.

Contrast this to deck.gl v4.1, where the idea was that each the of Viewport was associated with a specific controller (WebMercatorViewport has a MapController, etc).

* **Using Multiple Controllers** An application having multiple viewports might want to use different interaction in each viewport - this has multiple complications...
* **Switching Controllers** - An application that wants to switch between Viewports might want to switch between controllers, ideally this should not require too much coding effort.


## Remarks

* At first blush the way deck.gl multi viewport support is designed, especially in relation to base components, might seem a little surprising. It can be helpful to consider that deck.gl is limited to rendering into a single canvas, due to the one-to-one relation between a canvas and a `WebGLRenderingContext`.
* About viewport position and size coordinates: Internally, `gl.viewport` uses bottom-left, retina coordinates and normal CSS layout uses top left, non-retina coordinates. Translating between the two is surprisingly fiddly since both y coordinates and heights need to be stacked, and `devicePixelRatio` has to be matched to application settings, so having this translation taken care of by deck.gl was an explicit design goal.
