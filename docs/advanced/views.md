# Views

It is helpful to begin by thinking of a `View` essentially as a way to specify a "camera" to view your data.

## What is in a View

A view contains an `id`, a set of usually relative extents, .


## Choosing a View

deck.gl offers a set of `View` classes that lets you specify how deck.gl should render your data. Using `View` classes you can visualize your data from different perspectives (top down map view, first person view, etc) and in a specific area of the "screen" (e.g. the left half of the deck.gl canvas).

| View Class                                   | Description |
| ---                                          | ---         |
| [`View`](/docs/api-reference/view.md)        | The base view has to be supplied view and projection matrices. It is typically only instantiated directly if the application needs to work with views that have been supplied from external sources, such as the `WebVR` API. |
| [`MapView`](/docs/api-reference/map-view.md) | While all `View` subclasses are geospatially enabled, this class renders from a perspective that matches a typical top-down map and is designed to synchronize perfectly with a mapbox-gl base map (even in 3D enabled perspective mode).
| [`FirstPersonView`](/docs/api-reference/first-person-view.md) | The camera is positioned in the target point and looks in the direction provided. Allows the application to precisely control position and direct a `View`. |

Remarks:
* The base `View` class is normally only used directly if you need and are able to calculate your own projection matrices. it is often preferable to use a `View` subclass like `MapView` or `FirstPersonView`

It helps render data provided in different coordinate systems. Integration with Controllers work together with various event controllers enabling the user to control the viewpoint within your visualization.


## About Viewports

Note: in addition to `View` classes, deck.gl also has a hierarchy of `Viewport` classes. The main difference is that `Viewport` classes are focused on mathematical operations such as coordinate projection/unproject and calculation of projection matrices and GLSL uniforms.

Unless an application needs to project or unproject coordinates in JavaScript, they typically do not directly create `Viewport` classes. Instead `Viewport` classes are created automatically, "under the hood" based on the `View` classes supplied by the application.


## View Positioning

Views allow the application to specify the position and extent of the viewport (i.e. the target rendering area on the screen). Viewport positions are specified in CSS coordinates (top left, non-retina, these coordinates are different from WebGL coordinates, see remarks below). It is expected that CSS coordinates are most natural to work with, as the rest of the UI layout with other HTML components is done in the CSS coordinate system.

* **x,y coordinates** - Views allow specification of x,y coordinates in the viewport in additin to width and height. These are only used for positioning (and not for calculation of intrinsic viewport parameters).


## Multiple Views

The main deck.gl component (i.e. `Deck`, or `DeckGL` in React) accepts a list of `View` class instances.

It is common in 3D applications to render a 3D scene multiple times, with different cameras:
* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering, where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).


Views can be side-by-side (top and bottom in this first example). Note how the application controls both the height and the y position of the two views.
```js
  <DeckGL views=[
    new FirstPersonView({..., height: '50%'}),
    new WebMercatorView({...viewprops, y: '50%', height: '50%'}),
    ...
  ]/>
```

Side-by-side is of course essential for stereoscopic rendering (and conveniently, the base deck.gl viewport can directly accept view and projection matrices from the WebVR API):
```js
  <DeckGL views=[
    new View({
      id: 'left-eye',
      width: '50%',
      viewMatrix: leftViewMatrix,
      projectionMatrix: leftProjectionMatrix
    }),
    new View({
      id: 'right-eye',
      x: '50%',
      width: '50%',
      viewMatrix: rightViewMatrix,
      projectionMatrix: rightProjectionMatrix
    }),
    ...
  ]/>
```

Views can also overlap, (e.g. having a small "mini" map in the bottom middle of the screen overlaid over the main view)
```js
  <DeckGL views=[
    new FirstPersonView({
      id: 'first-person',
      ...
    }),
    new MapView({
      id: 'mini-map'
      x: '70%',
      y: '70%',
      height: '15%',
      width: '15%',
    })
  ]/>
```


### Picking in Multiple Views

deck.gl's built in picking support extends naturally to multiple viewports. The picking process renders all viewports.

Note that the `pickInfo` object does not contain a viewport reference, so you will not be able to tell which viewport was used to pick an object.


### Positioning React/HTML Components Behind Views

> This feature is currently only implemented in the React version of deck.gl.

One of the core features of deck.gl is enabling perfectly synchronized visualization overlays on top other React components and DOM elements. When using a single `View` this is quite easy (just make `DeckGL` canvas a child of the base component and make sure they have the same size). But when using multiple viewports, correctly positioning base components gets trickier, so deck.gl provides some assistance.

In this example the `StaticMap` component gets automatically position under the `WebMercatorViewport`:
```js
  const views = [
    new FirstPersonView({...}),
    new MapView({id: 'basemap', ...})
  ];

  render() {
    return (
      <DeckGL
          width={viewportProps.width}
          height={viewportProps.height}
          views={views}
          layers={this._renderLayers()} >

        <StaticMap
          viewId='basemap'
          {...viewportProps}/>

      </DeckGL>
    );
  }
```

### Performance Note

When viewports change, layers can get a chance to update their state: the `updateState({changeFlags: viewportChanged})` function will be called.

When rendering with many viewports there can be a concern that `updateState` gets called too many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers). However, since most layers do not need to update state when viewport changes, the `updateState` function is not automatically called on viewport change. To make sure it is called, the layer needs to override `shouldUpdateState`.


### Controller Support for Multiple Viewports

TBA - This is a planned feature:

**Restrict Event Handling to match Viewport Size** - Controllers need to be able to be restricted to a certain area (in terms of event handling). Some controllers are completely general (just general drag up/down):
* When working with a map controller, especially panning and zooming, the point under the mouse represents a grab point or a reference for the operation and mapping event coordinates correctly is imporant for the experience.
* Controllers might not be designed to receive coordinates from outside their viewports.
* Basically, if the map backing one WebMercator viewport doesn't fill the entire canvas, and the application wants to use a MapControls

Controllers will also benefit from be able to feed multiple viewports of different types. There are limits to this of course, in particular it would be nice if for instance a geospatially neabled FirstPerson controller can feed both a `FirstPersonViewport` and a `WebMercatorViewport`. Various different viewports must be created from one set of parameters.

Contrast this to deck.gl v4.1, where the idea was that each the of Viewport was associated with a specific controller (WebMercatorViewport has a MapController, etc).

* **Using Multiple Controllers** An application having multiple viewports might want to use different interaction in each viewport - this has multiple complications...
* **Switching Controllers** - An application that wants to switch between Viewports might want to switch between controllers, ideally this should not require too much coding effort.


## Remarks

* At first blush the way deck.gl multi viewport support is designed, especially in relation to base components, might seem a little surprising. It can be helpful to consider that deck.gl is limited to rendering into a single canvas, due to the one-to-one relation between a canvas and a `WebGLRenderingContext`.
* The coordinate system of `View` extents is defined in the "CSS" or window coordinate system of the containing HTML component and will be translated to device coordinates before `gl.viewport` is called.
