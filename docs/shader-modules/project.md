# Project (Vertex Shader)

The `project` shader module is part of the core of deck.gl. It makes it easy to write shaders that support all of deck.gl's projection modes and it supports many advanced rendering features such as pixel space rendering etc.

Note that the `project` module has a `project64` counterpart.


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
  vec3 vertex = positions * project_scale(instanceSize);
  gl_Position = project_to_clipspace(center + vertex);
}
```

## Methods

The projection module makes it easy to write vertex shaders that follow deck.gl's projection methods, enabling your layer to accept coordinates in both [longitude,latitude,altitude] or [metersX,metersY,metersZ] format. To support the basic features expected of a deck.gl layer, such as various viewport types and coordinate systems, your own shaders should always use the built-in projection functions.

### project_position

`vec2 project_position(vec2 position)`
`vec3 project_position(vec3 position)`
`vec4 project_position(vec4 position)`

Projects input to worldspace coordinates.


### project_scale

`float project_scale(float meters)`
`vec2 project_scale(vec2 meters)`
`vec3 project_scale(vec3 meters)`
`vec4 project_scale(vec4 meters)`

Projects input to worldspace sizes.

### project_to_clipspace

`vec4 project_to_clipspace(vec4 position)`


### add_screen_pixels_to_clipspace

Adds a pixel offset that DOES NOT vary with distance

`vec4 add_pixels_to_clipspace(vec4 position, vec2 pixels)`

* `position` (`vec4`) - Clip space position (normally `gl_Position`) that should be adjusted.
* `pixels` (`vec2`) - adjustment in logical pixels

Note: for consistent results, pixels are logical pixels, not device pixels, i.e. this method multiplies `pixels` with `project_uDevicePixelRatio`.


### add_sized_pixels_to_clipspace

Adds a pixel offset that DOES vary with the distance of the point being added to.

`vec4 add_projected_pixels_to_clipspace(vec4 position, vec2 pixels)`

Note: for consistent results, pixels are logical pixels, not device pixels, i.e. this method multiplies `pixels` with `project_uDevicePixelRatio`.
