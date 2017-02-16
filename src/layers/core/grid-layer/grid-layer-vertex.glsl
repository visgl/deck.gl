// Inspired by screen-grid-layer vertex shader in deck.gl

/* vertex shader for the grid-layer */
#define SHADER_NAME grid-layer-vs

attribute vec3 positions;
attribute vec3 normals;

attribute vec4 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Custom uniforms
uniform float extruded;
uniform float lonOffset;
uniform float latOffset;
uniform float opacity;

// A magic number to scale elevation so that 1 unit approximate to 100 meter
#define ELEVATION_SCALE 80.

// Result
varying vec4 vColor;

void main(void) {

  // cube gemoetry vertics are between -1 to 1, scale and transform it to between 0, 1
  vec2 ptPosition = instancePositions.xy + vec2((positions.x + 1.0 ) * lonOffset / 2.0, (positions.y + 1.0) * latOffset / 2.0);

  vec2 pos = project_position(ptPosition);

  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = project_scale(instancePositions.w  * (positions.z + 1.0) * ELEVATION_SCALE);
  }

  // extrude positions
  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0);
  vec4 position_worldspace = vec4(extrudedPosition, 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  if (renderPickingBuffer < 0.5) {
    float selected = isPicked(instancePickingColors, selectedPickingColor);

    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace,
        normals
      );
    }

    vec3 lightWeightedColor = lightWeight * (instanceColors.rgb / 255.);
    vec4 color = vec4(lightWeightedColor, instanceColors.a * opacity / 255.);
    vColor = color;

  } else {

    vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
     vColor = pickingColor;

  }
}
