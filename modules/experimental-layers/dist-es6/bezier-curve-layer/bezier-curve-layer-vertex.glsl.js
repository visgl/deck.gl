// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
export default `\
#define SHADER_NAME bezier-curve-layer-vertex-shader

attribute vec3 positions;
attribute vec3 instanceSourcePositions;
attribute vec3 instanceTargetPositions;
attribute vec3 instanceControlPoints;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float numSegments;
uniform float strokeWidth;
uniform float opacity;

varying vec4 vColor;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * strokeWidth / 2.0;
  vec2 offset_clipspace = project_pixel_to_clipspace(offset_screenspace).xy;

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
  vec4 source = project_to_clipspace(vec4(sourcePos, 1.0));
  vec4 target = project_to_clipspace(vec4(targetPos, 1.0));
  vec4 controlPoint = project_to_clipspace(vec4(controlPointPos, 1.0));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iZXppZXItY3VydmUtbGF5ZXIvYmV6aWVyLWN1cnZlLWxheWVyLXZlcnRleC5nbHNsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsZUFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5leHBvcnQgZGVmYXVsdCBgXFxcbiNkZWZpbmUgU0hBREVSX05BTUUgYmV6aWVyLWN1cnZlLWxheWVyLXZlcnRleC1zaGFkZXJcblxuYXR0cmlidXRlIHZlYzMgcG9zaXRpb25zO1xuYXR0cmlidXRlIHZlYzMgaW5zdGFuY2VTb3VyY2VQb3NpdGlvbnM7XG5hdHRyaWJ1dGUgdmVjMyBpbnN0YW5jZVRhcmdldFBvc2l0aW9ucztcbmF0dHJpYnV0ZSB2ZWMzIGluc3RhbmNlQ29udHJvbFBvaW50cztcbmF0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlQ29sb3JzO1xuYXR0cmlidXRlIHZlYzMgaW5zdGFuY2VQaWNraW5nQ29sb3JzO1xuXG51bmlmb3JtIGZsb2F0IG51bVNlZ21lbnRzO1xudW5pZm9ybSBmbG9hdCBzdHJva2VXaWR0aDtcbnVuaWZvcm0gZmxvYXQgb3BhY2l0eTtcblxudmFyeWluZyB2ZWM0IHZDb2xvcjtcblxuLy8gb2Zmc2V0IHZlY3RvciBieSBzdHJva2VXaWR0aCBwaXhlbHNcbi8vIG9mZnNldF9kaXJlY3Rpb24gaXMgLTEgKGxlZnQpIG9yIDEgKHJpZ2h0KVxudmVjMiBnZXRFeHRydXNpb25PZmZzZXQodmVjMiBsaW5lX2NsaXBzcGFjZSwgZmxvYXQgb2Zmc2V0X2RpcmVjdGlvbikge1xuICAvLyBub3JtYWxpemVkIGRpcmVjdGlvbiBvZiB0aGUgbGluZVxuICB2ZWMyIGRpcl9zY3JlZW5zcGFjZSA9IG5vcm1hbGl6ZShsaW5lX2NsaXBzcGFjZSAqIHByb2plY3RfdVZpZXdwb3J0U2l6ZSk7XG4gIC8vIHJvdGF0ZSBieSA5MCBkZWdyZWVzXG4gIGRpcl9zY3JlZW5zcGFjZSA9IHZlYzIoLWRpcl9zY3JlZW5zcGFjZS55LCBkaXJfc2NyZWVuc3BhY2UueCk7XG5cbiAgdmVjMiBvZmZzZXRfc2NyZWVuc3BhY2UgPSBkaXJfc2NyZWVuc3BhY2UgKiBvZmZzZXRfZGlyZWN0aW9uICogc3Ryb2tlV2lkdGggLyAyLjA7XG4gIHZlYzIgb2Zmc2V0X2NsaXBzcGFjZSA9IHByb2plY3RfcGl4ZWxfdG9fY2xpcHNwYWNlKG9mZnNldF9zY3JlZW5zcGFjZSkueHk7XG5cbiAgcmV0dXJuIG9mZnNldF9jbGlwc3BhY2U7XG59XG5cbmZsb2F0IGdldFNlZ21lbnRSYXRpbyhmbG9hdCBpbmRleCkge1xuICByZXR1cm4gc21vb3Roc3RlcCgwLjAsIDEuMCwgaW5kZXggLyBudW1TZWdtZW50cyk7XG59XG5cbnZlYzQgY29tcHV0ZUJlemllckN1cnZlKHZlYzQgc291cmNlLCB2ZWM0IHRhcmdldCwgdmVjNCBjb250cm9sUG9pbnQsIGZsb2F0IHNlZ21lbnRSYXRpbykge1xuICBmbG9hdCBtdCA9IDEuMCAtIHNlZ21lbnRSYXRpbztcbiAgZmxvYXQgbXQyID0gcG93KG10LCAyLjApO1xuICBmbG9hdCB0MiA9IHBvdyhzZWdtZW50UmF0aW8sIDIuMCk7XG5cbiAgLy8gcXVhZHJhdGljIGN1cnZlXG4gIGZsb2F0IGEgPSBtdDI7XG4gIGZsb2F0IGIgPSBtdCAqIHNlZ21lbnRSYXRpbyAqIDIuMDtcbiAgZmxvYXQgYyA9IHQyO1xuICAvLyBUT0RPOiBpZiBkZXB0aCBpcyBub3QgbmVlZGVkIHJlbW92ZSB6IGNvbXB1dGFpdG9ucy5cbiAgdmVjNCByZXQgPSB2ZWM0KFxuICAgIGEgKiBzb3VyY2UueCArIGIgKiBjb250cm9sUG9pbnQueCArIGMgKiB0YXJnZXQueCxcbiAgICBhICogc291cmNlLnkgKyBiICogY29udHJvbFBvaW50LnkgKyBjICogdGFyZ2V0LnksXG4gICAgYSAqIHNvdXJjZS56ICsgYiAqIGNvbnRyb2xQb2ludC56ICsgYyAqIHRhcmdldC56LFxuICAgIDEuMFxuICApO1xuICByZXR1cm4gcmV0O1xufVxuXG52b2lkIG1haW4odm9pZCkge1xuICAvLyBQb3NpdGlvblxuICB2ZWMzIHNvdXJjZVBvcyA9IHByb2plY3RfcG9zaXRpb24oaW5zdGFuY2VTb3VyY2VQb3NpdGlvbnMpO1xuICB2ZWMzIHRhcmdldFBvcyA9IHByb2plY3RfcG9zaXRpb24oaW5zdGFuY2VUYXJnZXRQb3NpdGlvbnMpO1xuICB2ZWMzIGNvbnRyb2xQb2ludFBvcyA9IHByb2plY3RfcG9zaXRpb24oaW5zdGFuY2VDb250cm9sUG9pbnRzKTtcbiAgdmVjNCBzb3VyY2UgPSBwcm9qZWN0X3RvX2NsaXBzcGFjZSh2ZWM0KHNvdXJjZVBvcywgMS4wKSk7XG4gIHZlYzQgdGFyZ2V0ID0gcHJvamVjdF90b19jbGlwc3BhY2UodmVjNCh0YXJnZXRQb3MsIDEuMCkpO1xuICB2ZWM0IGNvbnRyb2xQb2ludCA9IHByb2plY3RfdG9fY2xpcHNwYWNlKHZlYzQoY29udHJvbFBvaW50UG9zLCAxLjApKTtcblxuICAvLyBsaW5lYXIgaW50ZXJwb2xhdGlvbiBvZiBzb3VyY2UgJiB0YXJnZXQgdG8gcGljayByaWdodCBjb29yZFxuICBmbG9hdCBzZWdtZW50SW5kZXggPSBwb3NpdGlvbnMueDtcbiAgZmxvYXQgc2VnbWVudFJhdGlvID0gZ2V0U2VnbWVudFJhdGlvKHNlZ21lbnRJbmRleCk7XG4gIHZlYzQgcCA9IGNvbXB1dGVCZXppZXJDdXJ2ZShzb3VyY2UsIHRhcmdldCwgY29udHJvbFBvaW50LCBzZWdtZW50UmF0aW8pO1xuXG4gIC8vIG5leHQgcG9pbnRcbiAgZmxvYXQgaW5kZXhEaXIgPSBtaXgoLTEuMCwgMS4wLCBzdGVwKHNlZ21lbnRJbmRleCwgMC4wKSk7XG4gIGZsb2F0IG5leHRTZWdtZW50UmF0aW8gPSBnZXRTZWdtZW50UmF0aW8oc2VnbWVudEluZGV4ICsgaW5kZXhEaXIpO1xuICB2ZWM0IG5leHRQID0gY29tcHV0ZUJlemllckN1cnZlKHNvdXJjZSwgdGFyZ2V0LCBjb250cm9sUG9pbnQsIG5leHRTZWdtZW50UmF0aW8pO1xuXG4gIC8vIGV4dHJ1ZGVcbiAgZmxvYXQgZGlyZWN0aW9uID0gZmxvYXQocG9zaXRpb25zLnkpO1xuICBkaXJlY3Rpb24gPSBtaXgoLTEuMCwgMS4wLCBzdGVwKHNlZ21lbnRJbmRleCwgMC4wKSkgKiAgZGlyZWN0aW9uO1xuICB2ZWMyIG9mZnNldCA9IGdldEV4dHJ1c2lvbk9mZnNldChuZXh0UC54eSAtIHAueHksIGRpcmVjdGlvbik7XG4gIGdsX1Bvc2l0aW9uID0gcCArIHZlYzQob2Zmc2V0LCAwLjAsIDAuMCk7XG5cbiAgLy8gQ29sb3JcbiAgdkNvbG9yID0gdmVjNChpbnN0YW5jZUNvbG9ycy5yZ2IsIGluc3RhbmNlQ29sb3JzLmEgKiBvcGFjaXR5KSAvIDI1NS47XG5cbiAgLy8gU2V0IGNvbG9yIHRvIGJlIHJlbmRlcmVkIHRvIHBpY2tpbmcgZmJvIChhbHNvIHVzZWQgdG8gY2hlY2sgZm9yIHNlbGVjdGlvbiBoaWdobGlnaHQpLlxuICBwaWNraW5nX3NldFBpY2tpbmdDb2xvcihpbnN0YW5jZVBpY2tpbmdDb2xvcnMpO1xufVxuYDtcbiJdfQ==