# project (Shader Module)

The `project` shader module is part of the core of deck.gl. It makes it easy to write shaders that support all of deck.gl's projection modes and it supports some advanced rendering techniques such as pixel space rendering etc.

The `project` module has two extensions:
- [project32](/docs/shader-modules/project32.md) shorthand functions for projecting directly from worldspace to clipspace.
- [project64](/docs/shader-modules/project64.md) counterpart of `project32` that enables 64 bit projections, providing an increase in precision, at the cost of performance.


## Usage

Projects worldspace coordinates to clipspace coordinates.

```glsl
// instanced geometry
attribute vec3 positions;
// instance attributes
attribute vec3 instanceCenter;
attribute float instanceSize;

void main(void) {
  vec3 center = project_position(instanceCenter);
  vec3 vertex = positions * project_size(instanceSize);
  gl_Position = project_common_position_to_clipspace(center + vertex);
}
```

## getUniforms

The JavaScript uniforms are extracted from both contextual and per-layer props. The following information are used:

* `viewport`
* `devicePixelRatio`
* `coordinateSystem`
* `coordinateOrigin`
* `modelMatrix`


## GLSL Uniforms

Uniforms are considered private to each shader module. They may change in between patch releases. Always use documented functions instead of accessing module uniforms directly.

The uniforms of the `project` shader module are prefixed with `project_` in their names.

## GLSL Functions

The projection module makes it easy to write vertex shaders that follow deck.gl's projection methods, enabling your layer to accept coordinates in both [longitude,latitude,altitude] or [metersX,metersY,metersZ] format. To support the basic features expected of a deck.gl layer, such as various viewport types and coordinate systems, your own shaders should always use the built-in projection functions.

The functions converts positions/vectors between 4 coordinate spaces:

| Name | Short Name | Description |
|------|------|-------------|
| World space | `world` | The [coordinate system](/docs/developer-guide/coordinate-systems.md) defined by the layer, not necessarily linear or uniform. |
| Common space | `common` | A normalized intermediate 3D space that deck.gl uses for consistent processing of geometries, guaranteed to be linear and uniform. Therefore, it is safe to add/rotate/scale positions and vectors in this space. |
| Screen space | `pixel` | Top-left coordinate system runs from `[0, 0]` to `[viewportWidth, viewportHeight]` (see remarks below). |
| [Clip space](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#Clip_space) | `clipspace` | Output of the vertex shader. |

The GLSL functions of the `project` shader module uses the following naming convention:

```
project_[<source_space>]_<object_type>_[to_<target_space>]
```

* `source_space`: the short name of the coordinate space of the input. If not specified, the input is always in the `world` space.
* `object_type`: one of the following
  - `position`: absolute position of a point
  - `offset`: the delta between two positions
  - `normal`: the normal vector of a surface
  - `size`: the measurement of a geometry. This is different from `offset` in that `size` is uniform on all axes (e.g. [x, y, z] in meters in `LNGLAT` world space) and `offset` may not be (e.g. [dLon, dLat, dAlt] in degrees, degrees, and meters respectively in `LNGLAT` world space).
* `target_space`: the short name of the coordinate space of the output. If not specified, the output is always in the `common` space.

### project_position

```glsl
vec2 project_position(vec2 position)
vec3 project_position(vec3 position)
vec3 project_position(vec3 position, vec3 position64Low)
vec4 project_position(vec4 position)
vec4 project_position(vec4 position, vec3 position64Low)
```

Converts the coordinates of a point from the world space to the common space. The coordinates are interpreted according to `coordinateSystem` and `modelMatrix` is applied.


### project_size

```glsl
float project_size(float meters)
vec2 project_size(vec2 meters)
vec3 project_size(vec3 meters)
vec4 project_size(vec4 meters)
```

Converts the size of a geometry from the world space (meters if geospatial, and absolute units otherwise) to the common space.

### project_size_to_pixel

```glsl
float project_size_to_pixel(float size)
```

Converts the size of a geometry from the world space (meters if geospatial, and absolute units otherwise) to the common space. The result corresponds to the number of screen pixels when the given size is viewed with a top-down camera.

### project_pixel_size

```glsl
float project_pixel_size(float pixels)
float project_pixel_size(vec2 pixels)
```

Converts the size of a geometry from the screen space to the common space.

### project_pixel_size_to_clipspace

```glsl
vec2 project_pixel_size_to_clipspace(vec2 pixels)
```

Converts the size of a geometry from the screen space to the clip space.


### project_normal

```glsl
vec3 project_normal(vec3 vector)
```

Converts position deltas from the world space to normalized vector in the common space.


### project_common_position_to_clipspace

```glsl
vec4 project_common_position_to_clipspace(vec4 position)
```

Converts the coordinates of a point from the common space to the clip space, which can be assigned to `gl_Position` as the "return value" from the vertex shader.


## Remarks

* For consistent results, the screen space pixels are logical pixels, not device pixels, i.e. functions in the project module multiply `pixels` with `project_uDevicePixelRatio`.
* The pixels offsets will be divided by the `w` coordinate of `gl_Position`. This is simply the GPUs standard treatment of any coordinate. This means that there will be more pixels closer to the camera and less pixels further away from the camer. Setting the `focalDistance` uniform controls this.
* To avoid pixel sizes scaling with distance from camera, simply set `focalDistance` to 1 and multiply clipspace offset with `gl_Position.w`
