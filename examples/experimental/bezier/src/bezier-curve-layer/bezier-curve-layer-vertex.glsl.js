// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME bezier-curve-layer-vertex-shader

in vec3 positions;
in vec3 instanceSourcePositions;
in vec3 instanceTargetPositions;
in vec3 instanceControlPoints;
in vec4 instanceColors;
in vec3 instancePickingColors;

uniform float numSegments;
uniform float strokeWidth;
uniform float opacity;

out vec4 vColor;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * strokeWidth / 2.0;
  vec2 offset_clipspace = project_pixel_size_to_clipspace(offset_screenspace).xy;

  return offset_clipspace;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / numSegments);
}

vec4 computeBezierCurve(vec4 source, vec4 target, vec4 controlPoint, float segmentRatio) {
  float mt = 1.0 - segmentRatio;
  float mt2 = pow(mt, 2.0);
  float t2 = pow(segmentRatio, 2.0);

  // quadratic curve
  float a = mt2;
  float b = mt * segmentRatio * 2.0;
  float c = t2;
  // TODO: if depth is not needed remove z computaitons.
  vec4 ret = vec4(
    a * source.x + b * controlPoint.x + c * target.x,
    a * source.y + b * controlPoint.y + c * target.y,
    a * source.z + b * controlPoint.z + c * target.z,
    1.0
  );
  return ret;
}

void main(void) {
  // Position
  vec3 sourcePos = project_position(instanceSourcePositions);
  vec3 targetPos = project_position(instanceTargetPositions);
  vec3 controlPointPos = project_position(instanceControlPoints);
  vec4 source = project_common_position_to_clipspace(vec4(sourcePos, 1.0));
  vec4 target = project_common_position_to_clipspace(vec4(targetPos, 1.0));
  vec4 controlPoint = project_common_position_to_clipspace(vec4(controlPointPos, 1.0));

  // linear interpolation of source & target to pick right coord
  float segmentIndex = positions.x;
  float segmentRatio = getSegmentRatio(segmentIndex);
  vec4 p = computeBezierCurve(source, target, controlPoint, segmentRatio);

  // next point
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);
  vec4 nextP = computeBezierCurve(source, target, controlPoint, nextSegmentRatio);

  // extrude
  float direction = float(positions.y);
  direction = mix(-1.0, 1.0, step(segmentIndex, 0.0)) *  direction;
  vec2 offset = getExtrusionOffset(nextP.xy - p.xy, direction);
  gl_Position = p + vec4(offset, 0.0, 0.0);

  // Color
  vColor = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
