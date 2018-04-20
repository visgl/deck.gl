# lighting (Shader Module)

The `lighting` module provides a way to light a vertex using world positions and world normals.

## Usage

```glsl
// geometry
attribute vec3 positions;
attribute vec3 normals;
attribute vec3 colors;
// passed to fragment shader
varying vec4 vColor;

void main() {
  vec3 position_worldspace = project_position(positions);
  gl_Position = project_to_clipspace(vec4(position_worldspace, 1.0));

  float lightWeight = lighting_getLightWeight(
    position_worldspace,
    project_normal(normals)
  );

  vColor = vec4(lightWeight * colors, 1.0) / 255.0;
}
```


## getUniforms

The `lighting` module extracts uniforms from the `lightSettings` prop on layers that support lighting. The `lightSettings` prop is experimental and subject to change as we continue to improve this module.

`lightSettings` fields:

- `numberOfLights` (Number) - The number of lights, default `1`. Max number of lights is `5`.
- `lightsPosition` (Array) - The positions of lights specified as `[x, y, z]`, in a flattened array. The length should be `3 x numberOfLights`.
- `lightsStrength` (Array) - The strength of lights specified as `[x, y]`, in a flattened array. The length should be `2 x numberOfLights`.
- `coordinateSystem` (Number) - The coordinate system in which the light positions are specified. Default `COORDINATE_SYSTEM.LNGLAT`.
- `coordinateOrigin` (Number) - The coordinate origin to which the light positions are specified. Default `[0, 0, 0]`.
- `modelMatrix` (Number) - The transform matrix of the light positions. Default `null`.
- `ambientRatio` (Number) - The ambient ratio of the lights. Default `0.4`.
- `diffuseRatio` (Number) - The diffuse ratio of the lights. Default `0.6`.
- `specularRatio` (Number) - The specular ratio of the lights. Default `0.8`.


## GLSL Uniforms

| Uniform | Type | Description |
| --- | --- | --- |
| lighting_lightPositions | vec3[N] | light positions in world positions |
| lighting_lightStrengths | vec2[N] | light strengths |
| lighting_ambientRatio | float | ambient ratio |
| lighting_diffuseRatio | float | diffuse ratio |
| lighting_specularRatio | float | specular ratio |
| lighting_numberOfLights | float | number of lights |


## GLSL Functions

### lighting_getLightWeight

`float lighting_getLightWeight(vec3 position_worldspace_vec3, vec3 normals_worldspace)`
