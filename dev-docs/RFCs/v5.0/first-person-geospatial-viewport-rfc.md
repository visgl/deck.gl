# RFC - First Person Geospatial Viewport

* **Author**: Ib Green
* **Date**: August 10, 2017
* **Status**: **Implemented**

References:
* The initial [Infovis Viewport RFC](../v4.0/non-geospatial-viewports-rfc.md) for deck.gl v4.
* Controller Changes [Controller Architecture RFC](./controller-architecture-rfc.md)
* Initial review in [PR](https://github.com/visgl/deck.gl/pull/838)


## Overview

This RFC proposes:
* An "extended" Viewport hierarchy that adds subclasses based on "differences in view matrix" in addition to differences in projection matrix.
* The new hierarchy includes a "FirstPersonViewport" class that allows the application to specify eye position directly.
* All Viewports are "geospatially enabled", i.e. they can take a lng/lat anchor in addition to their normal coordinates.
* Viewports support the same options as layers, including model matrices so that apps can use their data coordinates to place FirstPersonViewports.


## Motivation

deck.gl is increasingly being used creating hybrid geospatial visualization apps, where we not only overlay abstract 3D data overlays on maps (like arcs and hexagons), but where we render actual 3D models (such as 3D buildings, car models and point clouds etc) on top of maps at local (human) scales.

These “hybrid” applications allows us to zoom from overhead map views down to “streetside” positions where it becomes less valuable (or even impossible, e.g. due to high pitch levels) to display overhead views of the map.

Instead it becomes interesting to give the user freedom to move the camera around in the 3D scene, as if being present inside it. It might for example be desirable to let the user take the viewpoint of a pedestrian on the street or take the driver’s seat of a car, and to enable the user to look around or even up (away from the ground/map), as if in a first person 3D game.


## Problem Description

There are multiple issues with the current camera system

* **Cartographic projection** deck.gl's current viewport system treats Web Mercator viewports as a special subclass, separate from normal perspective and orthographic cameras. This means that the `PerspectiveViewport` which would seem the natural choice for first person camera cannot be used with geospatial coordinates.

* **Camera Positioning** - When working with the traditional deck.gl `WebMercatorViewport`, the focus is not on specifying the position of the camera, but rather what position (lng/lat) we are looking at, and at what zoom, pitch and bearing we are looking at it. An appropriate camera position is then implicitly calculated (in a way that perfectly matches the way the underlying mapbox camera system), however the application does not have access to the camera position.

* **Camera Coordinates** - Our hybrid applications usually use data with coordinates in `METER_OFFSET`s, transformed by modelMatrices. Being able to position camera(s) in the same ways (relative coordinates + matrices) is critical as this would dramatically simplify applications by allowing them to set camera positions inside existing objects simply by copying their coordinates.

* **FOV sync** - Since our 3D geometry is completely general, we have the ability to show it from any camera position, height, and direction (including dual cameras for stereoscopic view etc).
However, to synchronize our 3D data with external perspective-enabled map systems like Mapbox GL, we need to adjust our 3D camera to follow the map’s when in “hybrid” map/3D mode.
The map system typically locks in FoV (Field of view), viewing angle (always pitched downward) and altitude (camera height over the “ground”).
When rendering 3D environments on top of pre-rendered video (e.g. overlaying perception data on top of vehicle log cameras)

## Proposed Features

### Proposed: Geospatially Enable all Viewports

In deck.gl 4.1 only the WebMercatorViewport can handle layers with geospatial coordinates: it is the only viewport that can produce the uniforms required by the project module. But moving some properties from the `WebMercatorViewport` class into the base viewport, it is possible to extend cartographic projection to all viewpott.

The key insight is that through the addition of the "meters mode", we have already addedthe general capability of overlaying an arbitrary linear coordinate system (which is what all non-geospatial viewports use) on top of a geospatial coordinate system using an anchor point.

While METER_OFFSETS mode was initially introduced to solve a narrow use-case, the technique is actually very general, and there is no reason why we would not support geospatial anchoring and linear coordinates for all viewports (in addition to layers), including first person and orbit (i.e. third person) viewports.

Note: There are subtleties around the positioning of the camera which is handled in the next proposal.


### Proposed: An Alternative Viewport Hierarchy

In deck.gl v4.0, a viewport class hierarchy was introduced to support non-geospatial viewports. It separates between `Perspective` and `Orthographic` cameras (inspired by common WebGL frameworks).

In retrospect this separation added little value as it captures a trivial part of the camera (the projection matrix), while leaving the more difficult problems unsolved, such as control of camera position and direction. Such aspects are particularly important to the planned animation extensions to deck.gl.

As an alternative to the `Perspective`/`Orthographic` camera class, this RFC recommends a `FirstPerson`/`ThirdPerson` division that focuses on the relative position and orientation of the camera.

Also, since the majority viewports will be used with a perspective projection matrix, if the `projectionMatrix` prop is not supplied, `Viewport` will try to create a perspective projection matrix using new `fov`, `near` and `far` props (note that `aspect` is automatically calculated from `width` and `height`).


## Proposed API Changes

### New `Viewport` Properties and Methods

New properties:
- `longitude` - (optional) anchor
- `latitude` - (optional) anchor
- `zoom` scale - This will be hardcoded to meter = unity scale by `FirstPersonViewport`
- `position` - this is a meter offset from the geospatial anchor, if supplied (or just a position if not).
* `modelMatrix`: Allows the application to apply a model matrix that transforms both the position and the direction of the camera (direction is handled by sub-classes.
- `projectionMatrix` - can now be omitted or set to `null`, in which case `Viewport` will try to create a perspective projection matrix from `fov`, `near`, `far`.
- `fov`
- `near`
- `far`

New Methods:
* `Viewport.isGeospatial()` can be called to check if a viewport is geospatially "enabled". If longitude, latitude and zoom  are supplied to a viewport, then that viewport is considered geospatial.
* `Viewport.isMapSynched()` offers an easy way for the app to determine if a base map can be displayed under the viewport.
* `Viewport.getMercatorParameters()` offers a way to get map props that include offsets etc.

Remarks:
* `modelMatrix` - A convenience to make the viewport API more similar to the `Layer` props. When positioning the camera in a scene with `Layer`s using a certain `modelMatrix` it is nice to be able to use the same coordinates and the same `modelMatrix` with the viewport.
* `projectionMatrix` - When supplied, the projectionMatrix parameter allows for complete application control of all **projection** matrix parameters - including field-of-view, near/far clipping planes, aspect ratios etc, e.g. using `new Matrix4().projection(...)` or `new Matrix4().ortho(...)` etc..


### Proposed: New `FirstPersonViewport` Class

Extends `Viewport`. Creates a `Viewport` with a view matrix that is placed in the player's position, with a controllable direction and orientation:
- `direction` (`Vector3`) - player direction
- `up` (`Vector3`, `[0, 0, 1]`): specifies the camera up direction


### Proposed: New `ThirdPersonViewport` Class

`ThirdPersonViewport` is expected to extend `Viewport`, possibly with props such as:
- player `direction`
- camera `direction`, relative to player direction (additive to player `direction`)
- camera `distance,` from player

The idea here with two directions being that one might want a third person camera to alwas look at the "player" or object at `position` from a certain relative angle. The absolute directions would be the "sum" of these two directions, modulo wrap-arounds.

See comments under `OrbitViewport` below.


### Proposed: `WebMercatorViewport` Changes

Creates a viewport with a special perspective projection matrix with a FOV that works with mapbox-gl, and a view matrix that follows mapbox-gl's undocumented internal bearing/pitch/altitude conventions.

inherits from `Viewport`, setting parameters as follows
- player position: lnglat
- player direction: north
- camera direction: pitch/bearing
- camera distance: altitude & zoom (zoom dependent, 1.5 screen "heights")
- fov: pitch dependent


* `WebMercatorViewport.isMapSynched()` - Overrides `Viewport.isMapSynched()`

`isMapSynched()` would return false for a `Viewport` (Note: not a `Layer`):
    * If `position` is specified
    * If `modelMatrix` is specified
    * If `altitude` is !== 0.5
    * If `pitch` > 60 degrees

We could also check zoom levels etc, potentially moving all mapbox limit checks into the `WebMercatorViewport` viewport.

Remarks:
* Note that this is really a `MapboxViewport` (at least when it comes to perspective mode) as it emulates mapbox-gl's choices of perspective projection. If we start exploring other base maps, we might need to generalize this part of the viewport hierarchy somewhat, but for backwards compatibility purposes, it is was preferred to not change the name of this viewport at this time.
* `WebMercatorViewport` could become a subclass of a "Third Person Viewport although this is not proposed for the initial refactor (mainly because there is not a lot of focus on `ThirdPersonViewport`). If `OrbitViewport` is consolidated with `ThirdPersonViewport` it could make sense to do this change for `WebMercatorViewport`.


### OrbitViewport

It is recommended that `OrbitViewport` be consolidated with `Viewport`, so that orbit viewports could be used with geospatial data (in this mode orbit viewport coordinates will be interpreted as meter offsets). Most likely either based on, or merged with, `ThirdPersonViewport` however to manage the scope of this RFC it is not part of the proposed changes.


### OrthographicViewport and PerspectiveViewport

These should be deprecated. Since they are not extensively used we could deprecate them directly in the next major release. That said, if needed, they can both be supplied as trivial subclasses of `FirstPersonViewport`.



## Additional Work: Controllers and Event Handling

While the initial use of FirstPersonViewports will be to have them attached to other objects in the geometry, we will soon need "controllers" for these Viewports.

This topic is turning out to be almost as complicated as the projection mode changes, so it has been broken out into a separate [Controller Architecture RFC](./controller-architecture-rfc.md).


## Open Issues and Discussion Points

- project/unproject - Pixel project/unproject to flat mercator coordinates may not work when pitch exceeds > 85 degrees.
