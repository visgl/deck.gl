#define SHADER_NAME extruded-hexagon-layer-vs

attribute vec3 positions;
attribute vec3 normals;

attribute vec3 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Projection uniforms
uniform float mercatorScale;
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 worldInverseTransposeMatrix;

// Custom uniforms
uniform float opacity;
uniform vec3 invisibleColor;
uniform float radius;
uniform float angle;
uniform float enable3d;

// Lighting constants
const vec3 ambientColor = vec3(1., 1., 1.);
const vec3 pointLocation = vec3(-1., 3., -1.);
const vec3 pointColor = vec3(1., 1., 1.);
const vec3 pointSpecularColor = vec3(0.6, 0.6, 0.6);
const float shininess = 3.;
const float pointLightAmbientCoefficient = 0.8;

// Result
varying vec4 vColor;

// A magic number to scale elevation so that 1 unit approximate to 100 meter
#define ELEVATION_SCALE 6000.

void main(void) {

  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec2 rPos = rotationMatrix * positions.xz;
  vec2 rNorm = rotationMatrix * normals.xz;

  vec3 rotatedPositions = vec3(rPos.x, positions.y, rPos.y);
  vec3 rotatedNormals = vec3(rNorm.x, normals.y, rNorm.y);

  // calculate elevation, if 3d not enabled set to 0
  float elevation = mix(0., instancePositions.z * ELEVATION_SCALE * (positions.y + 0.5), enable3d);

  // project center of hexagon
  vec4 centroidPosition = vec4(project_position(vec3(instancePositions.xy, elevation)), 0.0);

  gl_Position = project_to_clipspace(centroidPosition + vec4(vec2(rotatedPositions.xz * radius), 0., 1.));

  // check whether hexagon is currently picked
  float selected = isPicked(instancePickingColors, selectedPickingColor);

  // calculate lighting
  vec3 lightWeighting = getLightWeight(
    viewMatrix,
    worldMatrix,
    worldInverseTransposeMatrix,
    rotatedPositions,
    rotatedNormals,
    selected,
    ambientColor,
    pointLocation,
    pointColor,
    pointSpecularColor,
    pointLightAmbientCoefficient,
    shininess
  );

  vec3 lightWeightedColor = mix(vec3(1), lightWeighting, enable3d) * (instanceColors.rgb / 255.0);

  // Hide hexagon if set to invisibleColor
  float alpha = instanceColors.rgb == invisibleColor ? 0. : opacity;

  // Color: Either opacity-multiplied instance color, or picking color
  vec4 color = vec4(lightWeightedColor, alpha * instanceColors.a / 255.);

  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);

  vColor = mix(color, pickingColor, renderPickingBuffer);
}
