# Viewport

> Read the article detailing deck.gl's [Views and Projections](../../developer-guide/views.md) system.

A deck.gl `Viewport` is essentially a geospatially enabled camera, and combines a number of responsibilities, which can project and unproject 3D coordinates to the screen.

`Viewport` classes are focused on mathematical operations such as coordinate projection/unprojection, and calculation of `view` and `projection` matrices and other uniforms needed by the WebGL2/WebGPU vertex shaders. The basic `Viewport` class is a generic geospatially enabled version of the typical 3D "camera" class you would find in most 3D/WebGL2/OpenGL libraries.

While the `Viewport` class can certainly be used directly if you need and are able to calculate your own projection matrices, you typically do not directly create `Viewport` instances. Instead, `Viewport` classes are created using the [View](./view.md) class descriptors and the current `viewState`.

The base class uses an optional, already-resolved `crs` descriptor for its default
WGS84-to-target conversion and target-coordinate distance scales. Linear target axes default to metre-based common units using the descriptor’s unit factors.
Without a descriptor, positions remain in local coordinates; supplying longitude and latitude does not select
a projection. CRS resolution belongs to the View, not the viewport constructor.

Specialized viewports retain their projection conventions. In particular,
`WebMercatorViewport` and geospatial `FirstPersonViewport` use `@math.gl/web-mercator`
for their Mercator projection, altitude scaling, and high-precision distance scales.

## Overview of Viewport Classes

| Viewport Class        | Description |
| ---                   | ---         |
| [`Viewport`](./viewport.md)            | The base viewport has to be supplied view and projection matrices. It is typically only instantiated directly if the application needs to work with viewports that have been supplied from external sources, such as the `WebVR` API. |
| [`WebMercatorViewport`](./web-mercator-viewport.md) | While all `Viewport` subclasses are geospatially enabled, this class renders from a perspective that matches a typical top-down map and is designed to synchronize perfectly with a mapbox-gl base map (even in 3D enabled perspective mode).


## Usage

The `Viewport` class is normally not instantiated directly. The [`View`](./view.md) class is more commonly used by applications. deck.gl automatically creates `Viewport`s from `View`s and `viewState` when needed, using the `View.makeViewport` method.


## Constructor

```js
new Viewport({width: 500, height: 500, viewMatrix, projectionMatrix, ...});
```

General Parameters

* `x` (number, optional) - x position of viewport top-left corner. Default `0`.
* `y` (number, optional) - y position of viewport top-left corner. Default `0`.
* `width` (number) - Width of viewport. Default `1`.
* `height` (number) - Height of viewport. Default `1`.

View Matrix Parameters

* `viewMatrix` (number[16], optional) - 4x4 view matrix. Defaults to the identity matrix.

Position and CRS Options (Optional)

* `crs` (CRSDescriptor, optional) - Prepared target CRS. Default conversions accept WGS84 positions and produce target coordinates scaled into common space.
* `targetToCommonMatrix` (number[16], optional) - Affine transform from target CRS coordinates to common space, replacing default `unitsPerWorldUnit` scaling. Use it to align target axes with common space. Screen unprojection onto an elevation plane requires the transform to preserve horizontal planes.
* `distanceScales` (object or function, optional) - Partial distance scales, or a function that samples them at a world-coordinate anchor. The function receives no anchor when initializing camera scales. Default scale sampling uses the CRS descriptor.
* `zoom` (number, optional) - [zoom level](https://wiki.openstreetmap.org/wiki/Zoom_levels) .
* `focalDistance` (number, optional) - Modifier of the projection scale. Default `1`.

* `position` (number[3], optional) - Position of viewport camera. Default `[0, 0, 0]`.
* `modelMatrix` (number[16], optional) - Optional 4x4 model matrix applied to position.

Projection Matrix Parameters.

* `projectionMatrix` (number[16], optional) - 4x4 projection matrix.

If `projectionMatrix` is not supplied, an attempt is made to build from the remaining parameters. Otherwise the remaining parameters will be ignored.

* `fovy` (number, optional) - Field of view covered by camera, in the perspective case. In degrees. Default `75`.
* `near` (number, optional) - Distance of near clipping plane. Default `0.1`. (Note that in geospatial viewports, this actual distance used is scaled by the height of the screen).
* `far` (number, optional) - Distance of far clipping plane. Default `1000`. (Note that in geospatial viewports, this actual distance used is scaled by the height of the screen).
* `orthographic` (boolean, optional) - whether to create an orthographic or perspective projection matrix. Default `false` (perspective projection).


## Methods

#### `equals` {#equals}

Parameters:

* `viewport` (Viewport) - The viewport to compare with.

Returns:

* `true` if the given viewport is identical to the current one.


#### `project` {#project}

Projects world coordinates to pixel coordinates on screen.

Parameters:

* `coordinates` (number[]) - `[X, Y, Z]` in world units. `Z` is default to `0` if not supplied.
* `opts` (object)
  + `topLeft` (boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

* `[x, y]` or `[x, y, z]` in pixels coordinates. `z` is pixel depth.
  + If input is `[X, Y]`: returns `[x, y]`.
  + If input is `[X, Y, Z]`: returns `[x, y, z]`.


#### `unproject` {#unproject}

Unproject pixel coordinates on screen into world coordinates.

Parameters:

* `pixels` (number[]) - `[x, y, z]` in pixel coordinates. Passing a `z` is optional.
* `opts` (object)
  + `topLeft` (boolean, optional) - Whether projected coords are top left. Default to `true`.
  + `targetZ` (number, optional) - If pixel depth `z` is not specified in `pixels`, this is used as the elevation plane to unproject onto. Default `0`.

Returns:

* `[X, Y]` or `[X, Y, Z]` in world coordinates.
  + If input is `[x, y]` without specifying `opts.targetZ`: returns `[X, Y]`.
  + If input is `[x, y]` with `opts.targetZ`: returns `[X, Y, targetZ]`.
  + If input is `[x, y, z]`: returns `[X, Y, Z]`.


#### `projectPosition` {#projectposition}

Converts a position to the viewport's [common space](./project.md). To project coordinates from a different CRS, pass its resolved math.gl CRS descriptor as `options.sourceCrs`.

Parameters:

* `coordinates` (number[]) - `[x, y, z]`, with optional altitude. Defaults to longitude/latitude/altitude for geospatial viewports and local coordinates otherwise.
* `options.sourceCrs` (CRSDescriptor, optional) - The CRS of `coordinates`.

Returns:

* `[x, y, z]` in the viewport's common space.


#### `unprojectPosition` {#unprojectposition}

Projects a coordinate from the [common space](./project.md) to latitude, longitude and altitude.

Parameters:

* `coordinates` (number[]) - `[x, y, z]` in the WebMercator world. `z` is optional.

Returns:

* `[longitude, latitude, altitude]`


#### `getPreprojection`

Returns conversions between a source CRS and the CRS accepted by the viewport's projection shader.

- `sourceCrs` (`CRSDescriptor | null`) - Resolved source descriptor; `null` denotes Cartesian or meter-offset input.
- Returns `{preproject, unpreproject, packedCrs}`. Both functions are `null` when the shader accepts the source CRS directly. Otherwise, `preproject` converts source coordinates to packed coordinates and `unpreproject` reverses that conversion. `packedCrs` describes the attribute coordinates. These functions do not apply the layer's model matrix or coordinate origin.

#### `getBounds` {#getbounds}

Extracts the axis-aligned bounding box of the current visible area.

* `options` (object, optional)
  + `options.z` (number, optional) - To calculate a bounding volume for fetching 3D data, this option can be used to get the bounding box at a specific elevation. Default `0`.

Returns:
* `[minX, minY, maxX, maxY]` that defines the smallest orthogonal bounds that encompasses the visible region.


#### `getFrustumPlanes` {#getfrustumplanes}

Extract view frustum planes of the current camera. Each plane is defined by its normal `normal` and distance from
the origin `distance` (such that point `x` is on the plane if `dot(normal, x) === distance`) in the [common space](./project.md).

Returns:

* `{near: {normal, distance}, far: {normal, distance}, left: {normal, distance}, right: {normal, distance}, top: {normal, distance}, bottom: {normal, distance}}`

```js
import {Vector3} from '@math.gl/core';

// Culling tests must be done in common space
const commonPosition = new Vector3(viewport.projectPosition(point));

// Extract frustum planes based on current view.
const frustumPlanes = viewport.getFrustumPlanes();
let outDir = null;

// Check position against each plane
for (const dir in frustumPlanes) {
  const plane = frustumPlanes[dir];
  if (commonPosition.dot(plane.normal) > plane.distance) {
    outDir = dir;
    break;
  }
}
if (outDir) {
  console.log(`Point is outside of the ${outDir} plane`);
} else {
  console.log('Point is visible');
}
```

## Remarks

* The `Viewport` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.
* The `Viewport` class works together with the `project` shader module and generates the uniforms that module needs to project correctly in GLSL code.
* Accordingly, a main function of viewports is to generate WebGL2/WebGPU compatible view and projection matrices (column-major format).
* Functions (including projection and unprojection of coordinates) are available both in JavaScript and in GLSL, so that layers can do consistent projection calculations in both GLSL and JavaScript.
* To support pixel project/unproject functions (in addition to the clipspace projection that Camera classes typically manage), the `Viewport` is also aware of the viewport extents.
* In geospatial setups, Viewports can contain geospatial anchors.


### Geometry Approximation

![subdivision](https://raw.githubusercontent.com/visgl/deck.gl-data/refs/heads/master/images/docs/viewport-resolution.png)

<small>
Left to right: same polygons in resolution 0, 10, 60, rendering 487, 501, 591 outline vertices respectively.
Notice the shape of the 49th-parallel.
<br/><i>Natural Earth 1:110 country boundaries of continental Canada and United States. Albers projection, central metidian -96°, standard parallels 29.5° / 45.5°</i>
</small>


When a geometry is displayed in a different CRS from its definition, long segments are still rendered as straight lines, instead of warping along the surface of the new CRS.

Use `resolution` to divide long straight lines into smaller segments to better follow the shape of the target CRS. Subdivision adds vertices before projection so paths, polygon edges and bitmap meshes can follow projected curves more closely. Higher values produce finer detail, with more processing and memory overhead. Subdivision is by default disabled.

The setting is relative to the earth's circumference and works across source CRSs with different units. For example, `resolution: 36` gives a 10-degree step for WGS84 geometry. When implementing a custom layer, use `context.viewport.getSubdivisionStep(sourceCrs)` to retrieve a step in the geometry's source CRS units.

## Source

[modules/core/src/viewports/viewport.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/viewport.ts)
