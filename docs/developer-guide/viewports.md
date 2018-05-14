# Viewports

> If you are new to deck.gl's `View` and `Viewport` classes it is suggested that you start by reading up on [`Views`](/docs/developer-guide/views.md) before learning about `Viewports`. Most applications start by using `View` classes.


## Viewports

deck.gl provides a hierarchy of `Viewport` classes. Unless an application needs to project or unproject coordinates in JavaScript, they typically do not directly create `Viewport` classes. Instead, `Viewport` classes are created under the hood based on the `View` class descriptors.

`Viewport` classes are focused on mathematical operations such as coordinate projection/unprojection and calculation of projection matrices and GLSL uniforms.

As mentioned, the basic `Viewport` class is a generic geospatially enabled version of the typical 3D "camera" class you would find in most 3D/WebGL/OpenGL library, holding `view` and `projection` matrices and other uniforms needed by the WebGL vertex shaders.

While the `Viewport` class can certainly be used directly if you need and are able to calculate your own projection matrices. it is often preferable to use a `Viewport` subclass that takes higher level parameters, such as camera position and viewing direction, or map coordinates, rather than working directly with matrices.

In addition to generating WebGL uniforms, the `Viewport` class also offers JavaScript functions to project and unproject as well as getting local distance scales.


## Overview of Viewports

| Viewport Class        | Description |
| ---                   | ---         |
| [`Viewport`](/docs/api-reference/viewport.md)            | The base viewport has to be supplied view and projection matrices. It is typically only instantiated directly if the application needs to work with viewports that have been supplied from external sources, such as the `WebVR` API. |
| [`WebMercatorViewport`](/docs/api-reference/web-mercator-viewport.md) | While all `Viewport` subclasses are geospatially enabled, this class renders from a perspective that matches a typical top-down map and is designed to synchronize perfectly with a mapbox-gl base map (even in 3D enabled perspective mode).


## About Geospatial Positioning

A special property of the `Viewport` classes that set them apart from a typical OpenGL Camera class is that it has the necessary plumbing to support non-linear Web Mercator projection.

Like many things in deck.gl, Viewports can be positioned using a lng/lat "anchor" and a meter offset. See the article about coordinate systems for more information about this setup.


## Viewport Positioning

Viewports allow the application to specify the position and extent of the viewport (i.e. the target rendering area on the screen). Viewport positions are specified in CSS coordinates (top left, non-retina, these coordinates are different from WebGL coordinates, see remarks below). It is expected that CSS coordinates are most natural to work with, as the rest of the UI layout with other HTML components is done in the CSS coordinate system.

* **x,y coordinates** - Viewports allow specification of x,y coordinates in the viewport in additin to width and height. These are only used for positioning (and not for calculation of intrinsic viewport parameters).


## Remarks

* About viewport position and size coordinates: Internally, `gl.viewport` uses bottom-left, retina coordinates and normal CSS layout uses top left, non-retina coordinates. Translating between the two is surprisingly fiddly since both y coordinates and heights need to be stacked, and `devicePixelRatio` has to be matched to application settings, so having this translation taken care of by deck.gl was an explicit design goal.
* For the `project`/`unproject` JavaScript functions, the default pixel coordinate system of the viewport is defined with the origin in the top left, where the positive x-axis goes right, and the positive y-axis goes down. That is, the top left corner is `[0, 0]` and the bottom right corner is `[width - 1, height - 1]`. The functions have a flag that can reverse this convention.
* Non-pixel projection matrices are obviously bottom left.
* Mercator coordinates are specified in "lng-lat" format [lng, lat, z] format (which naturally corresponds to [x, y, z]).
* It is possible to query the WebMercatorViewport for a meters per pixel scale. Note that that distance scales are latitude dependent under web mercator projection (see [http://wiki.openstreetmap.org/wiki/Zoom_levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) for more details), so scaling will depend on the viewport center and any linear scale factor should only be expected to be locally correct.
