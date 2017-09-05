# RFC - First Person Mercator Controls

* **Author**: Ib Green
* **Date**: August 10, 2017
* **Status**: **Pre-Approved**

Notes:
* Please add comments as reviews to the [PR](https://github.com/uber/deck.gl/pull/838)

References:
* Initial [Infovis Viewport RFC]() for deck.gl v4.


## Motivation

deck.gl is increasingly being used creating hybrid geospatial visualization apps, where we not only overlay abstract 3D data overlays on maps (like arcs and hexagons), but where we render actual 3D models (such as 3D buildings, car models and point clouds etc) on top of maps at local (human) scales.

These “hybrid” applications allows us to zoom from overhead map views down to “streetside” positions where it becomes less valuable (or even impossible) to display overhead views of the map.

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


## Proposal 1: Geospatially Enable all Viewports

The key insight here is that through the addition of "meters mode", we now have the general capability of overlaying a normal linear coordinate system (which is what all non-geospatial viewports use) on top of a geospatial coordinate system using an anchor point.

While METER_OFFSETS mode was initially introduced to solve a narrow use-case, the technique is very general, and there is no reason why we could not (optionally) support this for all viewports, including first person and orbit (i.e. third person) viewports.

In deck.gl 4.1 only the WebMercatorViewport can handle layers with geospatial coordinates: it is the only viewport that can produce the uniforms required by the project module. But moving some properties from the `WebMercatorViewport` class into the base viewport, it is possible to extend cartographic projection to all viewpott.

Note: There are subtleties around the positioning of the camera which is handled in the next proposal.


### Viewport

The current base viewport class would be extended with a lnglat property, meaning that any viewport can calculate the uniforms required for layers with geospatial coordinate systems.
- lnglat anchor
- zoom scale

As background, there are a couple critical uniforms needed by the `project` shader module when handling layers with data using geospatial coordinates.
- projection center
- distance scales

### Viewport

- lnglat anchor
- zoom scale
- viewMatrix
- projectionMatrix - allows for complete application control of all **projection** matrix parameters (including fovs, near/far clipping planes, aspect ratios etc, e.g. using `Matrix4.projection` or `Matrix4.ortho` etc).




## Proposal 2: An Alternative Viewport Hierarchy

In deck.gl v4.0, a viewport class hierarchy was introduced to support non-geospatial viewports. It separates between `Perspective` and `Orthographic` cameras (inspired by common WebGL frameworks). But in retrospect this separation adds little value as it captures a trivial part of the camera (the projection matrix), while leaving the more difficult problems unsolved, such as control of camera position and direction. Such aspects are very important, particularly for the planned animation extensions to deck.gl.

As an alternative to the `Perspective`/`Orthographic` camera class, this RFC recommends a `FirstPerson`/`ThirdPerson` division.




### FirstPersonViewport

extends `Viewport`

- player position (lngLat anchor + offset)
- player direction (TBD)


### ThirdPersonViewport

extends `Viewport`

- player position
- player direction
- camera direction, relative to player direction
- camera distance, from player

The idea here with two directions being that one might want a third person camera to alwas look at the "player" or object at `position` from a certain relative angle. The absolute directions would be the "sum" of these two directions, modulo wrap-arounds.


### WebMercatorViewport

inherits from `ThirdPersonViewport`, setting parameters as follows
- player position: lnglat
- player direction: north
- camera direction: pitch/bearing
- camera distance: altitude & zoom (zoom dependent, 1.5 screen "heights")
- fov: pitch dependent

The current WebMercatorViewport could become a subclass of a "Third Person Viewport:

It is really a `MapboxViewport` (at least when it comes to perspective mode) as it emulates mapbox-gl's choices of perspective projection.




## Proposal 3: Add `Viewport.isMapSynched` method to control map display

The application can now switch freely between `Viewport`s, however the base map is typically (mapbox-gl) very constrained in what view points it allows. It would therefore be good to offer an easy way for the app to easily determine if the base map can be displayed.


### Viewport changes

* `Viewport.isMapSynched()` (`Boolean`, `false`)- A new method (intended to be overriden by subclasses) indicating if the map can be displayed with these viewport settings. Would return false by default.


### WebMercatorViewport changes

* `WebMercatorViewport.isMapSynched()` - Overrides `Viewport.isMapSynched()`

* if true, the generated projection matrix works with mapbox. false, the generated view projection matrices do not match the map. Normally the application would disable map display when isMapSynched() returns false

`IsMapSynched()` would return false
    * If `position` is specified
    * If `modelMatrix is specified
    * If `altitude is !== 0.5
    * If `pitch > 60 degrees
We could also check zoom levels, potentially moving all mapbox limit checks into the `WebMercatorViewport` viewport.


## Additional Work: Event Handling

While the initial use of FirstPersonViewports will be to have them attached to other objects in the geometry, we will soon need "controllers" for these Viewports.

What is the best way to pan (effectively, move around) when viewing at 90 degrees pitch.
* Do we want a command-mouse drag [THREE.js pointer-lock controls](https://threejs.org/examples/misc_controls_pointerlock.html)
* Should we provide a classic keyboard interface (arrow keys)?


### Switching between modes.

One could imagine asking the application to switch both event controllers and viewport classes when switching between modes. This would keep the Viewports cleaner but make integration harder for the app.

The separation between Viewports / State / Controls / React Controllers is powerful but could perhaps be streamlined. A couple of preparatory PRs have reduced the amount of duplicated code, to simplify work in this area.

## Open Issues and Discussion Points

* Up directions: ability to specify the camera up direction
* `modelMatrix`: Allows the application to apply a modelMatrix that transforms both the position and the direction of the camera. Should this be part of the camera
* meterOffset? - it might convenient to allow the camera to be moved around using meter offsets compared to a lngLat anchor rather than having to recalculate lngLats on every mode.
- project/unproject - Pixel project/unproject to flat mercator coordinates may not work when pitch exceeds > 85 degrees.
* VR view matrices - can support for left and right eye matrices be integrated somehow?



## Appendix A: Notes on the `project` shader module

* In cartographic coordinate systems, the `project` shader module internally deals with mercator coordinates projected to current zoom level.

As can be seen, the position will:
* Step 1: For linear coordinate systems, `modelMatrix` is applied => normally brings positions to axis aligned (meter) offsets from an anchor point.
* Step 2: positions are "scaled" => this converts coordinates (meters) to "pixel" units
* Step 3: 'viewProjectionMatrix' is applied
* Step 4: 'projectionCenter' is added (subtracted)
