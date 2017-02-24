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

// Custom uniforms
uniform float opacity;
uniform float radius;
uniform float angle;
uniform float extruded;
uniform float coverage;
uniform float elevationScale;

// Result
varying vec4 vColor;

// A magic number to scale elevation so that 1 unit approximate to 1 meter.
#define ELEVATION_SCALE 0.8


void main(void) {

  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec2 rPos = rotationMatrix * positions.xz;
  vec2 rNorm = rotationMatrix * normals.xz;

  vec3 rotatedPositions = vec3(rPos.x, positions.y, rPos.y);
  vec3 rotatedNormals = vec3(rNorm.x, normals.y, rNorm.y);

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -0.5 to 0.5, transform it to between 0, 1
  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = project_scale(instancePositions.z * (positions.y + 0.5) * ELEVATION_SCALE * elevationScale);
}

  float dotRadius = radius * clamp(coverage, 0.0, 1.0);
  // // project center of hexagon

  vec4 centroidPosition = vec4(project_position(instancePositions.xy), elevation, 0.0);

  vec4 position_worldspace = centroidPosition + vec4(vec2(rotatedPositions.xz * dotRadius), 0., 1.);

  gl_Position = project_to_clipspace(position_worldspace);

  // render display
  if (renderPickingBuffer < 0.5) {

    // TODO: we should allow the user to specify the color for "selected element"
    // check whether hexagon is currently picked.
    float selected = isPicked(instancePickingColors, selectedPickingColor);

    // Light calculations
    // Worldspace is the linear space after Mercator projection

    vec3 normals_worldspace = rotatedNormals;

    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace,
        normals_worldspace
      );
    }

    vec3 lightWeightedColor = lightWeight * instanceColors.rgb;

    // Color: Either opacity-multiplied instance color, or picking color
    vec4 color = vec4(lightWeightedColor, opacity * instanceColors.a) / 255.0;

    vColor = color;

  } else {

    vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.0);
    vColor = pickingColor;

  }
}
