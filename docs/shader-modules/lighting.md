# lighting (Shader Module)

The `lighting` module provides a way to light a vertex using world positions and world normals.


## getUniforms

* `vec3 lightsPosition[16]`
* `vec2 lightsStrength[16]`
* `float ambientRatio`
* `float diffuseRatio`
* `float specularRatio`


## GLSL Functions

### lighting_getLightWeight

`float lighting_getLightWeight(vec3 position_worldspace_vec3, vec3 normals_worldspace)`
