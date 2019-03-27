# project32 (Shader Module)

The `project32` shader module is an extension of the [project](/docs/api-reference/shader-modules/project.md) shader module that adds some projection utilities.

## GLSL Functions

### project_position_to_clipspace

32 bit implementation of the `project_position_to_clipspace` interface.

```glsl
vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset)
vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset, out vec4 worldPosition)
```

Parameters:

* `position` - vertex position in the layer's coordinate system.
* `position64xyLow` - always ignored
* `offset` - meter offset from the coordinate
* `worldPosition` - projected position in the world space

Returns:
Projected position in the clipspace.
