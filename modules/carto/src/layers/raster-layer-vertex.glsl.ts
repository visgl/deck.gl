export default `\
#version 300 es
#define SHADER_NAME raster-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in float instanceElevations;
in vec4 instanceFillColors;
in vec4 instanceLineColors;

in vec3 instancePickingColors;

// Custom uniforms
uniform float opacity;
uniform bool extruded;
uniform bool stroked;
uniform bool isStroke;
uniform float coverage;
uniform float elevationScale;
uniform float widthScale;
uniform vec3 offset;

// Result
out vec4 vColor;
#ifdef FLAT_SHADING
out vec4 position_commonspace;
#endif

void main(void) {
  // Rather than positioning using attribute, layout pixel grid using gl_InstanceID
  vec2 common_position = offset.xy;
  float scale = offset.z;

  int yIndex = - (gl_InstanceID / 256);
  int xIndex = gl_InstanceID + (yIndex * 256);
  common_position += scale * vec2(float(xIndex), float(yIndex));

  vec4 color = isStroke ? instanceLineColors : instanceFillColors;

  // if alpha == 0.0 or z < 0.0, do not render element
  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
  float cellWidth = coverage * scale;

  // Get position directly from quadbin, rather than projecting
  // Important to set geometry.position before using project_ methods below
  // as geometry.worldPosition is not set (we don't know our lat/long)
  geometry.position = vec4(common_position, 0.0, 1.0);
  if (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    geometry.position.xyz -= project_uCommonOrigin;
  }

  // calculate elevation, if 3d not enabled set to 0
  // cylindar geometry height are between -1.0 to 1.0, transform it to between 0, 1
  float elevation = 0.0;
  // calculate stroke offset
  float strokeOffsetRatio = 1.0;

  if (extruded) {
    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * elevationScale;
  } else if (stroked) {
    float halfOffset = project_pixel_size(widthScale) / cellWidth;
    if (isStroke) {
      strokeOffsetRatio -= sign(positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  geometry.pickingColor = instancePickingColors;

  // project center of column
  vec2 offset = (vec2(0.5) + positions.xy * strokeOffsetRatio) * cellWidth * shouldRender;
  vec3 pos = vec3(offset, project_size(elevation));
  DECKGL_FILTER_SIZE(pos, geometry);

  geometry.position.xyz += pos;
  gl_Position = project_common_position_to_clipspace(geometry.position);

  geometry.normal = project_normal(normals);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  // Light calculations
  if (extruded && !isStroke) {
#ifdef FLAT_SHADING
    position_commonspace = geometry.position;
    vColor = vec4(color.rgb, color.a * opacity);
#else
    vec3 lightColor = lighting_getLightColor(color.rgb, project_uCameraPosition, geometry.position.xyz, geometry.normal);
    vColor = vec4(lightColor, color.a * opacity);
#endif
  } else {
    vColor = vec4(color.rgb, color.a * opacity);
  }

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
