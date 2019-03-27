# project (Shader Module)

The `project` shader module is part of the core of deck.gl. It makes it easy to write shaders that support all of deck.gl's projection modes and it supports some advanced rendering techniques such as pixel space rendering etc.

Note that the `project` module has a `project64` counterpart that enables 64 bit projections, providing an increase in precision, at the cost of performance. Note that starting with deck.gl v6.1, the improved default 32 bit projection mode provides sufficient precision for most use cases.


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
  gl_Position = project_to_clipspace(center + vertex);
}
```

## getUniforms

The JavaScript uniforms are extracted mainly from the viewport with a few additional parameters (which deck.gl supplies from `LayerManager` state or `Layer` props of course).

Provided by `LayerManager`:

* `viewport`
* `devicePixelRatio`

Provided by `Layer` props:

* `coordinateSystem`
* `coordinateOrigin`
* `modelMatrix`


## GLSL Uniforms

Uniform names are not considered part of the official API of shader modules and can potentially change between minor releases, but are documented for applications that need this level of access. Use the module's public GLSL functions instead of directly accessing uniforms when possible.

| Uniform | Type | Description |
| --- | --- | --- |
| project_uModelMatrix | mat4 | model matrix (identity if not supplied) |
| project_uViewProjectionMatrix | mat4 | combined view projection matrix |
| project_uViewportSize | vec2 | size of viewport in pixels |
| project_uDevicePixelRatio | float | device pixel ratio of current viewport (value depends on `useDevicePixels` prop) |
| project_uFocalDistance | float | distance where "pixel sizes" are display in 1:1 ratio (modulo `devicePixelRatio`) |
| project_uCameraPosition | vec3 | position of camera in world space |
| project_uCoordinateSystem | float | COORDINATE_SYSTEM enum |
| project_uCenter | float | coordinate origin in world space |
| project_uScale | float | Web Mercator scale (2^zoom) |
| project_uDistancePerMeter | vec3 | Web Mercator pixels per meter near the current viewport center |
| project_uDistancePerDegree | vec3 | Web Mercator pixels per degree near the current viewport center |


## GLSL Functions

The projection module makes it easy to write vertex shaders that follow deck.gl's projection methods, enabling your layer to accept coordinates in both [longitude,latitude,altitude] or [metersX,metersY,metersZ] format. To support the basic features expected of a deck.gl layer, such as various viewport types and coordinate systems, your own shaders should always use the built-in projection functions.

### project_position

`vec2 project_position(vec2 position)`
`vec3 project_position(vec3 position)`
`vec4 project_position(vec4 position)`

Projects positions (coordinates) to worldspace coordinates. The coordinates are interpreted according to `coordinateSystem` and `modelMatrix` is applied.


### project_size

`float project_size(float meters)`
`vec2 project_size(vec2 meters)`
`vec3 project_size(vec3 meters)`
`vec4 project_size(vec4 meters)`

Projects sizes in meters to worldspace offsets. These offsets can be added directly to values returned by `project_position`.


### project_normal

`vec3 project_normal(vec3 vector)`

Projects position deltas in the current coordinate system to worldspace normals.


### project_to_clipspace

Projects world space coordinates to clipspace, which can be assigned to `gl_Position` as the "return value" from the vertex shader.

`vec4 project_to_clipspace(vec4 position)`


### project_pixel_to_clipspace

Converts the given number of pixels to a clipspace offset that can be added to a clipspace position (typically added to values returned by `project_to_clipspace`).

`vec4 project_pixel_to_clipspace(vec2 pixels)`

* `pixels` (`vec2`) - adjustment in logical pixels. Returns values in clip space offsets that can be added directly to `gl_Position`


### project_pixel_to_worldspace

Converts screen-space pixels to world distance.

`float project_pixel_to_worldspace(float pixels)`

### project_size_to_pixels

Converts size in meters to screen-space pixels.

`float project_size_to_pixels(float distance)`

## Remarks

* For consistent results, pixels are logical pixels, not device pixels, i.e. this method multiplies `pixels` with `project_uDevicePixelRatio`.
* The pixels offsets will be divided by the `w` coordinate of `gl_Position`. This is simply the GPUs standard treatment of any coordinate. This means that there will be more pixels closer to the camera and less pixels further away from the camer. Setting the `focalDistance` uniform controls this.
* To avoid pixel sizes scaling with distance from camera, simply set `focalDistance` to 1 and multiply clipspace offset with `gl_Position.w`
