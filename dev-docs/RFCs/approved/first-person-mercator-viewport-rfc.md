# RFC - First Person Mercator Controls

* **Author**: Ib Green
* **Date**: August 10, 2017
* **Status**: **Approved**

Notes:
* Please add comments as reviews to the [PR](https://github.com/uber/deck.gl/pull/838)


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


## Proposal: Support for Cartographic Projection in all Viewports

In deck.gl 4.1 only the WebMercatorViewport can handle layers with geospatial coordinates, as it is the only viewport that can produce the uniforms required by the project module.

By moving some of the required properties into the base viewport, it would be possible to extend cartographic projection to all cameras.

Note: There are subtleties around the positioning of the camera which is handled in the next proposal.


### Viewport

The current base viewport class would be extended with a lnglat property, meaning that any viewport can calculate the uniforms required for layers with geospatial coordinate systems.
- lnglat anchor
- zoom scale

As background, there are a couple critical uniforms needed by the `project` shader module when handling layers with data using geospatial coordinates.
- projection center
- distance scales



## Proposal: An Alternative Viewport Hierarchy

In deck.gl v4.0, a viewport class hierarchy was introduced to support non-geospatial viewports. It separates between Perspective and Orthographic cameras (inspired by common WebGL frameworks).

In retrospect this separation adds little value as it captures a trivial part of the camera (the projection matrix), while leaving the more difficult problems unsolved, such as control of camera position and direction. Such aspects are important, particularly for the planned animation extensions to deck.gl.

As an alternative to the `Perspective`/`Orthographic` camera class, a `FirstPerson`/`ThirdPerson` approach.

### Viewport

- lnglat anchor
- zoom scale
- viewMatrix
- projectionMatrix - allows for complete application control of all **projection** matrix parameters (including fovs, near/far clipping planes, aspect ratios etc, e.g. using `Matrix4.projection` or `Matrix4.ortho` etc).


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


## Proposal: Add `Viewport.isMapSynched` method to control map display

As the application will now switch between cameras (viewports), some of which can occasionally display the base map, it would be good to offer an easy way for the app to determine if the base map can be displayed

A new method or property, `isMapSynched` would return false by default, however `WebMercatorViewport` would override it.

* if true, the generated projection matrix works with mapbox. false, the generated view projection matrices do not match the map. Normally the application would disable map display when isMapSynched() returns false

`IsMapSynched()` would return false
    * If `position` is specified
    * If `modelMatrix is specified
    * If `altitude is !== 0.5
    * If `pitch > 60 degrees
We could also check zoom levels, potentially moving all mapbox limit checks into the `WebMercatorViewport` viewport.


## Proposal: Viewport View Matrix Decomposition support

Extract traditional camera parameters from any Viewport? We have the `viewMatrix`, which can be decomposed using standard 4x4 matrix techniques.

Possible methods:
* `WebMercatorViewport.getCameraPosition`
* `WebMercatorViewport.getCameraLookAt`
* `WebMercatorViewport.getCameraUp`
* `WebMercatorViewport.getFov`
* `WebMercatorViewport.getClippingPlanes` -> [near, far]


## Proposal: SphericalCoordinates class

While projection matrix creation functions typically take a `lookAt` (Vector3) parameter, directions are often specified as spherical coordinates (pitch and bearing).
* To make is easy to use both spherical coordinates and direction vectors for the camera, we can extend our math library with a SphericalCoordinates class to make transformations between direction vectors and spherical coordinates easy. We already have an initial implementation.


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


## References:

Initial [Infovis Viewport RFC]() for deck.gl v4.

deck.gl implementation PRs:
* [Viewport class refactor](https://github.com/uber/deck.gl/pull/841)
* [Keyboard Event Handling](https://github.com/uber/deck.gl/pull/842)
deck.gl preparatory PRs:
* [Reorganize projection module files](https://github.com/uber/deck.gl/pull/825)
* [Reorganize controllers phase 1](https://github.com/uber/deck.gl/pull/827)
* [Reorganize controllers phase 2](https://github.com/uber/deck.gl/pull/833)
* [Remove UTM offsets mode](https://github.com/uber/deck.gl/pull/836)
luma.gl PRs:
* [Expose Euler angles, Add SphericalCoordinates](https://github.com/uber/luma.gl/pull/295)


## Appendix A: Notes on the `project` shader module

* In cartographic coordinate systems, the `project` shader module internally deals with mercator coordinates projected to current zoom level.

* The projection center is calculated separately

```
// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 project_mercator_(vec2 lnglat) {
  return vec2(
    radians(lnglat.x) + PI,
    PI - log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

vec2 project_scale(vec2 meters) {
  return meters * projectionPixelsPerUnit.xy;
}

vec4 project_position(vec4 position) {
  if (projectionMode == PROJECT_MERCATOR) {
    return vec4(
      project_mercator_(position.xy) * WORLD_SCALE * projectionScale,
      project_scale(position.z),
      position.w
    );
  }

  // Apply model matrix
  vec4 position_modelspace = modelMatrix * position;

  return project_scale(position_modelspace);
}

vec4 project_to_clipspace(vec4 position) {
  if (projectionMode == PROJECT_MERCATOR_OFFSETS || projectionMode == PROJECT_UTM_OFFSETS) {
    position.w *= projectionPixelsPerUnit.z;
  }
  return projectionMatrix * position + projectionCenter;
}
```

As can be seen, the position will:
* Step 1: For linear coordinate systems, `modelMatrix` is applied => normally brings positions to axis aligned (meter) offsets from an anchor point.
* Step 2: positions are "scaled" => this converts coordinates (meters) to "pixel" units
* Step 3: 'viewProjectionMatrix' is applied
* Step 4: 'projectionCenter' is added (subtracted)


## Appendix B: Alternative proposal: Generalize WebMercatorViewport

For completeness: As an alternate proposal to refactoring the entire Viewport hierarchy, we might be able to just generalize the `WebMercatorViewport`

Currently takes lat/lon/zoom/pitch/bearing “props”.

Propose adding the following props:
* `fov`: (radian) - Allows the application to set fov. Defaults to map synched fov (> 60 degrees pitch gives fov at 60 degrees).
* `position`: [x, y, z]: Position in METER_OFFSETS, from [lng lat] base point.
Relation to altitude - Allows the application to set the height of the camera in meters (without affecting other parameters).
* etc

This proposal is not favored, mainly because:
* it keeps adding to an already complicated class
* it does not handle geospatial coordinates in the general case
