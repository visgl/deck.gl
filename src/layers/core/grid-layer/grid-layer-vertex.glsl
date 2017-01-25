// Inspired by screen-grid-layer vertex shader in deck.gl

/* vertex shader for the grid-layer */
#define SHADER_NAME grid-layer-vs
#define LIGHT_MAX 1

attribute vec3 positions;
attribute vec3 normals;

attribute vec4 instancePositions;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Projection uniforms
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 worldInverseTransposeMatrix;

// Custom uniforms
uniform float enable3d;
uniform float lngDelta;
uniform float latDelta;
uniform float opacity;

uniform float testScale;

// Lighting constants
const vec3 ambientColor = vec3(0.8, 0.8, 0.8);
const vec3 pointLocation = vec3(1.5, 1.5, 5.);
const vec3 pointColor = vec3(0.7, 0.7, 0.7);
const vec3 pointSpecularColor = vec3(0.6, 0.6, 0.6);
const float shininess = 3.;
const float pointLightAmbientCoefficient = 1.;

// A magic number to scale elevation so that 1 unit approximate to 100 meter
#define ELEVATION_SCALE 80.

// Result
varying vec4 vColor;

void main(void) {


  // cube gemoetry vertics are between -1 to 1, scale and transform it to between 0, 1
  vec2 ptPosition = instancePositions.xy + vec2((positions.x + 1.0 ) * lngDelta / 2.0, (positions.y + 1.0) * latDelta / 2.0);

  vec2 pos = project_position(ptPosition);

  // if 3d not enabled set elevation to 0
  float elevation =  mix(0., project_scale(instancePositions.w  * (positions.z + 1.) * ELEVATION_SCALE), enable3d);

  // extrude positions
  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.);

  float selected = isPicked(instancePickingColors, selectedPickingColor);

  vec3 lightWeighting = getLightWeight(
    viewMatrix,
    worldMatrix,
    worldInverseTransposeMatrix,
    positions,
    normals,
    selected,
    ambientColor,
    pointLocation,
    pointColor,
    pointSpecularColor,
    pointLightAmbientCoefficient,
    shininess
  );

  vec3 lightWeightedColor = mix(vec3(1), lightWeighting, enable3d) * (instanceColors / 255.0);
  vec4 color = vec4(lightWeightedColor, opacity);

  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);

  vColor = mix(color, pickingColor, renderPickingBuffer);

  gl_Position = project_to_clipspace(vec4(extrudedPosition, 1.0));
}
