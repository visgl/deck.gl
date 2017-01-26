#define SHADER_NAME path-layer-vertex-shader

attribute float directions;
attribute vec3 positions;
attribute vec3 leftDeltas;
attribute vec3 rightDeltas;

attribute vec4 colors;
attribute vec3 pickingColors;

uniform float thickness;
uniform float miterLimit;
uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

// calculate line join positions
vec2 lineJoin(vec3 prevProjected, vec3 currProjected, vec3 nextProjected) {
  // get 2D screen coordinates
  vec2 prevScreen = prevProjected.xy;
  vec2 currScreen = currProjected.xy;
  vec2 nextScreen = nextProjected.xy;

  float len = project_scale(thickness);

  vec2 dir = vec2(0.0);
  if (currScreen == prevScreen) {
    // starting point uses (next - current)
    dir = normalize(nextScreen - currScreen);
  } else if (currScreen == nextScreen) {
    // ending point uses (current - previous)
    dir = normalize(currScreen - prevScreen);
  } else {
    // somewhere in middle, needs a join
    // get directions from (C - B) and (B - A)
    vec2 dirA = normalize(currScreen - prevScreen);
    vec2 dirB = normalize(nextScreen - currScreen);
    // now compute the miter join normal and length
    vec2 tangent = normalize(dirA + dirB);
    vec2 perp = vec2(-dirA.y, dirA.x);
    vec2 miterVec = vec2(-tangent.y, tangent.x);
    dir = tangent;
    len *= min(miterLimit, 1.0 / dot(miterVec, perp));
  }
  vec2 normal = vec2(-dir.y, dir.x);
  normal *= len / 2.0;

  return currProjected.xy + normal * directions;
}

void main() {
  vec4 color = vec4(colors.rgb, colors.a * opacity) / 255.;
  vec4 pickingColor = vec4(pickingColors.rgb, 255.) / 255.;
  vColor = mix(color, pickingColor, renderPickingBuffer);

  vec3 prevProjected = project_position(positions - leftDeltas);
  vec3 currProjected = project_position(positions);
  vec3 nextProjected = project_position(positions + rightDeltas);

  gl_Position = project_to_clipspace(
    vec4(
      lineJoin(prevProjected, currProjected, nextProjected),
      currProjected.z + 0.1,
      1.0
    )
  );
}
