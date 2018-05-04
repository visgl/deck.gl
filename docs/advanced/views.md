# Views

> View classes are a recent addition to deck.gl. We are still refining the documentation.

View classes can be thought of as "descriptors" that specify **where** and **how** deck.gl should draw.

However, the view does not specify **what** should be drawn, e.g. the "position" that should be displayed. This information needs to be provided separately to deck.gl in the form of one or more "view state" objects. Also a `View` has no knowledge of the actual size of the deck.gl "canvas". Instead, it contains relative sizes that adapt to the current size of the canvas.

The particular `View` subclass chosen defines how deck.gl layers will be rendered. The set of view state parameters that will be used varies between Views.

> Note that if no `View` is specified, deck.gl will automatically create a `MapView` that fills the whole canvas, so basic geospatial applications often do not have to specify any `View`s.

To summarize:

A `View` instance defines

* How deck.gl layers will be rendered (`MapView`, `FirstPersonView`) etc.
* Which `viewState` parameters will be used.

A `View` instance contains

* a (relative) rectangle on the screen specifying where your data should be displayed, together with
* certain "camera parameters" specifying how your data should be "projected".

A `View` instance does not contain

* the current size of the deck.gl canvas (screen)
* the actual `viewState`, i.e. the "world" position that should be displayed in the view.

The `viewState` prop is typically provided to the main `Deck` or `DeckGL` classes. These classes automatically combine `viewState` with `View` instances when required.

deck.gl allows multiple views to be specified, allowing the application to divide the screen into multiple similar or diffenrent views. These views can be synchronized or separately controlled by the user or the application.

Finally, the React version of deck.gl can automatically position other components, such as base maps and labels, relative to `View` instances.


## What is in a View?

A view specifies

* An `id`, which is used not only for debugging but to e.g. position base components relative to views.
* Relative extents (`x`, `y`, `width`, `height`). These are typically specified in "CSS-like" percentage strings, e.g. `width: '50%'`.
* Projection mode parameters (e.g. perspective vs. orthographic)


## Choosing a View

> Normally the application works with subclasses of `View`. However, in cases where the application needs to use "externally" generated view or projection matrices (such as WebVR), the `View` class can be used directly.

deck.gl offers a set of `View` classes that lets you specify how deck.gl should render your data. Using `View` classes you can visualize your data from different perspectives (top down map view, first person view, etc).

| View Class                                                     | View State  | Description |
| ---                                                            | ---         | ---         |
| [`View`](/docs/api-reference/view.md)                          |             | The base view has to be supplied view and projection matrices. It is typically only instantiated directly if the application needs to work with views that have been supplied from external sources, such as the `WebVR` API. |
| [`MapView`](/docs/api-reference/map-view.md)                   | geoposition | While all `View` subclasses are geospatially enabled, this class renders from a perspective that matches a typical top-down map and is designed to synchronize perfectly with a mapbox-gl base map (even in 3D enabled perspective mode).
| [`FirstPersonView`](/docs/api-reference/first-person-view.md)  |(geo)position| The camera is positioned in the view state position and looks in the direction provided. Allows the application to precisely control camera position. |
| [`ThirdPersonView`](/docs/api-reference/first-person-view.md)  |(geo)position| The camera looks at the "view state" position from the direction provided. |

| [`OrthographicView`](/docs/api-reference/orthographic-view.md) | ?           | The camera is positioned in the target point and looks in the direction provided. Allows the application to precisely control position and direct a `View`. |
| [`PerspectiveView`](/docs/api-reference/perspective-view.md)   | ?           | The camera is positioned in the target point and looks in the direction provided. Allows the application to precisely control position and direct a `View`. |
| [`OrbitView`](/docs/api-reference/perspective-view.md)         | "Orbit"     |  The camera is positioned in the target point and looks in the direction provided. Allows the application to precisely control position and direct a `View`. |


## Choosing a Projection Mode

The `View` class allows the application full control of what projection to use through the `projection` prop, which expects a function that can transform view properties into a projection matrix:

* The `projection` function will be called with the `View`s props, merged with `width`, `height`, `aspect` and `distance`.
* The `projection` function must return a 4x4 matrix (a 16 element array in column-major order).

Applications would typically use matrix creation methods from math libraries like [math.gl](https://uber-web.github.io/math.gl/#/documentation/overview) or [gl-matrix](http://glmatrix.net/). Examples of math.gl functions that can be used are:

| Projection                      | Needs View Parameters | Description    |
| ---                             | ---                   | ---            |
| `Matrix4.perspective` (Default) | `fovy`, `near`, `far` | A standard perspective projection. Extracts `aspect` from the current viewport extents. |
| `Matrix4.orthographic`          | `fovy`, `near`, `far` | An orthographic projection based on same parameters as `perspective`. Uses `distance` in the view state. |
| `Matrix4.ortho`                 | `top`, `bottom`, `left`, `rignt`, `near`, `far` | Traditional, explicit ortographic projection parameters. Needs the additional parameters to be specified on the `View`. |

While the projections suggested in the table leverage stock methods in the math.gl library, custom projection matrices can be returned.

As an example, a perspective / orthographic mode switch could be implemented as follows:

```js
import {View} from 'deck.gl';
import {Matrix4} from 'math.gl';
// Views with matching perspective and orthographic projections
new View({projection: props => Matrix4.perspective(props), fovy, near, far, ...});
new View({projection: props => Matrix4.orthographic(props), fovy, near, far, ...});
// View with traditional orthographic projection, perhaps for 2D rendering
new View({projection: props => Matrix4.ortho(props), left, right, top, bottom, ...});
```

## Positioning a View on the Screen

Views allow the application to specify the position and extent of the viewport (i.e. the target rendering area on the screen). `View`s are typically specified using relative coordinates and dimensions via "CSS style" percentage strings.

* **x,y coordinates** - `x`, `y` top left coordinates on the canvas, typically given as relative percentages or zero.
* **width and height** - `width`, `height` dimensions the viewport, typically as relative percentages.

```js
import {View} from 'deck.gl';
new View({y: '50%', height: '50%'})
```

## Controlling What Each View Displays

When it comes time to actually render something, each `View` needs to be know from what position and direction to view your data. The application needs to specify a compatible view state. To learn more, see [view states](/docs/advanced/view-state.md).

Note that your `View` instance can be associated with a different "view state" each render.

> Limitation: Currently the `Deck` component only accepts a single `Deck.viewState` prop that is used by all `View` instances. In future releases, it will be possible to specify different view states for different view ids.


## Projecting Coordinates Using Views

While a `View` by itself does not contain enough information to support projection and unprojection of coordinates, calling `view.getViewport({viewState, width, height})` with a "view state" and `width` and `height` values for the WebGL canvas, creates a [`Viewport`](/docs/api-reference/viewport.md) that in turn can be used to efficiently project and unproject coordinates.


## Using Multiple Views

The main deck.gl component (i.e. `Deck`, or `DeckGL` if using React) takes a `view` prop that accepts a list of `View` instances.

Common examples in 3D applications that render a 3D scene multiple times with different "cameras":

* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering, where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).


Views can be side-by-side (top and bottom in this first example). Note how the application controls both the height and the y position of the two views.

```js
  <DeckGL views=[
    new FirstPersonView({..., height: '50%'}),
    new WebMercatorView({..., y: '50%', height: '50%'}),
    ...
  ]/>
```

Side-by-side views are used for basic stereoscopic rendering. In addition, the `View` class can directly accept view and projection matrices from the WebVR API):

```js
  <DeckGL views=[
    new View({
      id: 'left-eye',
      width: '50%',
      viewMatrix: leftViewMatrix,
      projection: () => leftProjectionMatrix
    }),
    new View({
      id: 'right-eye',
      x: '50%',
      width: '50%',
      viewMatrix: rightViewMatrix,
      projection: () => rightProjectionMatrix
    }),
    ...
  ]/>
```

Views can also overlap, (e.g. having a small "mini" map in the bottom middle of the screen overlaid over the main view)

```js
  <DeckGL views=[
    new FirstPersonView({id: 'first-person', ...}),
    new MapView({id: 'mini-map', x: '70%', y: '70%', height: '15%', width: '15%'})
  ]/>
```


### Picking in Multiple Views

deck.gl's built-in picking support extends naturally to multiple viewports. The picking process renders all viewports.

Note that the `pickInfo` object does not contain a viewport reference, so you will not be able to tell which viewport was used to pick an object.


### Auto-Positioning React/HTML Components Behind Views

> This feature is currently only implemented in the React version of deck.gl.

One of the core features of deck.gl is enabling perfectly synchronized visualization overlays on top other React components and DOM elements. When using a single `View` this is quite easy (just make `DeckGL` canvas a child of the base component and make sure they have the same size). But when using multiple viewports, correctly positioning base components gets trickier, so deck.gl provides some assistance.

In this example the `StaticMap` component gets automatically positioned under the `WebMercatorViewport`:

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


## Remarks

* CSS Coordinates - If using absolute coordinates, the coordinate system of `View` extents is defined in the "CSS" or window coordinate system of the containing HTML component and will be translated to device coordinates before `gl.viewport` is called.
* `Viewport`s - in addition to `View` classes, deck.gl also has a hierarchy of `Viewport` classes. `Viewport` classes are focused on mathematical operations such as coordinate projection/unproject and calculation of projection matrices and GLSL uniforms. Unless an application needs to project or unproject coordinates in JavaScript, they typically do not directly create `Viewport` classes. Instead `Viewport` classes are created automatically, "under the hood" based on the `View` classes supplied by the application.
* Performance - When viewports change, layers can get a chance to update their state: the `updateState({changeFlags: viewportChanged})` function will be called. When rendering with many viewports there can be a concern that `updateState` gets called too many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers). However, since most layers do not need to update state when viewport changes, the `updateState` function is not automatically called on viewport change. To make sure it is called, the layer needs to override `shouldUpdateState`.
