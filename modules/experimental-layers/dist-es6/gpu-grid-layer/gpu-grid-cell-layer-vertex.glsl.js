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
// Inspired by screen-grid-layer vertex shader in deck.gl
export default `\
#version 300 es
#define SHADER_NAME gpu-grid-cell-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec4 instanceCounts;

// Custom uniforms
uniform float extruded;
uniform float cellSize;
uniform float coverage;
uniform float opacity;
uniform float elevationScale;

uniform vec2 gridSize;
uniform vec2 gridOrigin;
uniform vec2 gridOriginLow;
uniform vec2 gridOffset;
uniform vec2 gridOffsetLow;
uniform vec4 minColor;
uniform vec4 maxColor;
layout(std140) uniform;
uniform AggregationData
{
  vec4 maxCount;
} aggregationData;

#define ELEVATION_SCALE 100.

// Result
out vec4 vColor;

void main(void) {

  float noRender = float(instanceCounts.g <= 0.0);

  float step = instanceCounts.g / aggregationData.maxCount.w;
  vec4 color = mix(minColor, maxColor, step) / 255.;

  // TODO: discard when noRender is true
  float finalCellSize = project_scale(cellSize) * mix(1.0, 0.0, noRender);
  // float finalCellSize = project_scale(cellSize);


  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = instanceCounts.g  * (positions.z + 1.0) *
      ELEVATION_SCALE * elevationScale;
  }

  float yIndex = floor(float(gl_InstanceID) / gridSize[0]);
  float xIndex = float(gl_InstanceID) - (yIndex * gridSize[0]);

  // Keeping 32-bit calculations for debugging, to be removed.
  // float instancePositionX = gridOffset[0] * xIndex + gridOrigin[0];
  // float instancePositionY = gridOffset[1] * yIndex + gridOrigin[1];
  // vec3 extrudedPosition = vec3(instancePositionX, instancePositionY, elevation);
  // vec2 extrudedPosition64xyLow = vec2(0., 0.);

  vec2 instancePositionXFP64 = mul_fp64(vec2(gridOffset[0], gridOffsetLow[0]), vec2(xIndex, 0.));
  instancePositionXFP64 = sum_fp64(instancePositionXFP64, vec2(gridOrigin[0], gridOriginLow[0]));
  vec2 instancePositionYFP64 = mul_fp64(vec2(gridOffset[1], gridOffsetLow[1]), vec2(yIndex, 0.));
  instancePositionYFP64 = sum_fp64(instancePositionYFP64, vec2(gridOrigin[1], gridOriginLow[1]));
  vec3 extrudedPosition = vec3(instancePositionXFP64[0], instancePositionYFP64[0], elevation);
  vec2 extrudedPosition64xyLow = vec2(instancePositionXFP64[1], instancePositionYFP64[1]);

  vec3 offset = vec3(
    (positions.x * coverage + 1.0) / 2.0 * finalCellSize,
    (positions.y * coverage - 1.0) / 2.0 * finalCellSize,
    1.0);

  // extrude positions
  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(extrudedPosition, extrudedPosition64xyLow, offset, position_worldspace);

  float lightWeight = 1.0;

  if (extruded > 0.5) {
    lightWeight = lighting_getLightWeight(
      position_worldspace.xyz, // the w component is always 1.0
      normals
    );
  }

  vec3 lightWeightedColor = lightWeight * color.rgb;
  vColor = vec4(lightWeightedColor, color.a * opacity);
}
`;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncHUtZ3JpZC1sYXllci9ncHUtZ3JpZC1jZWxsLWxheWVyLXZlcnRleC5nbHNsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQSxlQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIEluc3BpcmVkIGJ5IHNjcmVlbi1ncmlkLWxheWVyIHZlcnRleCBzaGFkZXIgaW4gZGVjay5nbFxuXG5leHBvcnQgZGVmYXVsdCBgXFxcbiN2ZXJzaW9uIDMwMCBlc1xuI2RlZmluZSBTSEFERVJfTkFNRSBncHUtZ3JpZC1jZWxsLWxheWVyLXZlcnRleC1zaGFkZXJcblxuaW4gdmVjMyBwb3NpdGlvbnM7XG5pbiB2ZWMzIG5vcm1hbHM7XG5cbmluIHZlYzQgaW5zdGFuY2VDb3VudHM7XG5cbi8vIEN1c3RvbSB1bmlmb3Jtc1xudW5pZm9ybSBmbG9hdCBleHRydWRlZDtcbnVuaWZvcm0gZmxvYXQgY2VsbFNpemU7XG51bmlmb3JtIGZsb2F0IGNvdmVyYWdlO1xudW5pZm9ybSBmbG9hdCBvcGFjaXR5O1xudW5pZm9ybSBmbG9hdCBlbGV2YXRpb25TY2FsZTtcblxudW5pZm9ybSB2ZWMyIGdyaWRTaXplO1xudW5pZm9ybSB2ZWMyIGdyaWRPcmlnaW47XG51bmlmb3JtIHZlYzIgZ3JpZE9yaWdpbkxvdztcbnVuaWZvcm0gdmVjMiBncmlkT2Zmc2V0O1xudW5pZm9ybSB2ZWMyIGdyaWRPZmZzZXRMb3c7XG51bmlmb3JtIHZlYzQgbWluQ29sb3I7XG51bmlmb3JtIHZlYzQgbWF4Q29sb3I7XG5sYXlvdXQoc3RkMTQwKSB1bmlmb3JtO1xudW5pZm9ybSBBZ2dyZWdhdGlvbkRhdGFcbntcbiAgdmVjNCBtYXhDb3VudDtcbn0gYWdncmVnYXRpb25EYXRhO1xuXG4jZGVmaW5lIEVMRVZBVElPTl9TQ0FMRSAxMDAuXG5cbi8vIFJlc3VsdFxub3V0IHZlYzQgdkNvbG9yO1xuXG52b2lkIG1haW4odm9pZCkge1xuXG4gIGZsb2F0IG5vUmVuZGVyID0gZmxvYXQoaW5zdGFuY2VDb3VudHMuZyA8PSAwLjApO1xuXG4gIGZsb2F0IHN0ZXAgPSBpbnN0YW5jZUNvdW50cy5nIC8gYWdncmVnYXRpb25EYXRhLm1heENvdW50Lnc7XG4gIHZlYzQgY29sb3IgPSBtaXgobWluQ29sb3IsIG1heENvbG9yLCBzdGVwKSAvIDI1NS47XG5cbiAgLy8gVE9ETzogZGlzY2FyZCB3aGVuIG5vUmVuZGVyIGlzIHRydWVcbiAgZmxvYXQgZmluYWxDZWxsU2l6ZSA9IHByb2plY3Rfc2NhbGUoY2VsbFNpemUpICogbWl4KDEuMCwgMC4wLCBub1JlbmRlcik7XG4gIC8vIGZsb2F0IGZpbmFsQ2VsbFNpemUgPSBwcm9qZWN0X3NjYWxlKGNlbGxTaXplKTtcblxuXG4gIGZsb2F0IGVsZXZhdGlvbiA9IDAuMDtcblxuICBpZiAoZXh0cnVkZWQgPiAwLjUpIHtcbiAgICBlbGV2YXRpb24gPSBpbnN0YW5jZUNvdW50cy5nICAqIChwb3NpdGlvbnMueiArIDEuMCkgKlxuICAgICAgRUxFVkFUSU9OX1NDQUxFICogZWxldmF0aW9uU2NhbGU7XG4gIH1cblxuICBmbG9hdCB5SW5kZXggPSBmbG9vcihmbG9hdChnbF9JbnN0YW5jZUlEKSAvIGdyaWRTaXplWzBdKTtcbiAgZmxvYXQgeEluZGV4ID0gZmxvYXQoZ2xfSW5zdGFuY2VJRCkgLSAoeUluZGV4ICogZ3JpZFNpemVbMF0pO1xuXG4gIC8vIEtlZXBpbmcgMzItYml0IGNhbGN1bGF0aW9ucyBmb3IgZGVidWdnaW5nLCB0byBiZSByZW1vdmVkLlxuICAvLyBmbG9hdCBpbnN0YW5jZVBvc2l0aW9uWCA9IGdyaWRPZmZzZXRbMF0gKiB4SW5kZXggKyBncmlkT3JpZ2luWzBdO1xuICAvLyBmbG9hdCBpbnN0YW5jZVBvc2l0aW9uWSA9IGdyaWRPZmZzZXRbMV0gKiB5SW5kZXggKyBncmlkT3JpZ2luWzFdO1xuICAvLyB2ZWMzIGV4dHJ1ZGVkUG9zaXRpb24gPSB2ZWMzKGluc3RhbmNlUG9zaXRpb25YLCBpbnN0YW5jZVBvc2l0aW9uWSwgZWxldmF0aW9uKTtcbiAgLy8gdmVjMiBleHRydWRlZFBvc2l0aW9uNjR4eUxvdyA9IHZlYzIoMC4sIDAuKTtcblxuICB2ZWMyIGluc3RhbmNlUG9zaXRpb25YRlA2NCA9IG11bF9mcDY0KHZlYzIoZ3JpZE9mZnNldFswXSwgZ3JpZE9mZnNldExvd1swXSksIHZlYzIoeEluZGV4LCAwLikpO1xuICBpbnN0YW5jZVBvc2l0aW9uWEZQNjQgPSBzdW1fZnA2NChpbnN0YW5jZVBvc2l0aW9uWEZQNjQsIHZlYzIoZ3JpZE9yaWdpblswXSwgZ3JpZE9yaWdpbkxvd1swXSkpO1xuICB2ZWMyIGluc3RhbmNlUG9zaXRpb25ZRlA2NCA9IG11bF9mcDY0KHZlYzIoZ3JpZE9mZnNldFsxXSwgZ3JpZE9mZnNldExvd1sxXSksIHZlYzIoeUluZGV4LCAwLikpO1xuICBpbnN0YW5jZVBvc2l0aW9uWUZQNjQgPSBzdW1fZnA2NChpbnN0YW5jZVBvc2l0aW9uWUZQNjQsIHZlYzIoZ3JpZE9yaWdpblsxXSwgZ3JpZE9yaWdpbkxvd1sxXSkpO1xuICB2ZWMzIGV4dHJ1ZGVkUG9zaXRpb24gPSB2ZWMzKGluc3RhbmNlUG9zaXRpb25YRlA2NFswXSwgaW5zdGFuY2VQb3NpdGlvbllGUDY0WzBdLCBlbGV2YXRpb24pO1xuICB2ZWMyIGV4dHJ1ZGVkUG9zaXRpb242NHh5TG93ID0gdmVjMihpbnN0YW5jZVBvc2l0aW9uWEZQNjRbMV0sIGluc3RhbmNlUG9zaXRpb25ZRlA2NFsxXSk7XG5cbiAgdmVjMyBvZmZzZXQgPSB2ZWMzKFxuICAgIChwb3NpdGlvbnMueCAqIGNvdmVyYWdlICsgMS4wKSAvIDIuMCAqIGZpbmFsQ2VsbFNpemUsXG4gICAgKHBvc2l0aW9ucy55ICogY292ZXJhZ2UgLSAxLjApIC8gMi4wICogZmluYWxDZWxsU2l6ZSxcbiAgICAxLjApO1xuXG4gIC8vIGV4dHJ1ZGUgcG9zaXRpb25zXG4gIHZlYzQgcG9zaXRpb25fd29ybGRzcGFjZTtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0X3Bvc2l0aW9uX3RvX2NsaXBzcGFjZShleHRydWRlZFBvc2l0aW9uLCBleHRydWRlZFBvc2l0aW9uNjR4eUxvdywgb2Zmc2V0LCBwb3NpdGlvbl93b3JsZHNwYWNlKTtcblxuICBmbG9hdCBsaWdodFdlaWdodCA9IDEuMDtcblxuICBpZiAoZXh0cnVkZWQgPiAwLjUpIHtcbiAgICBsaWdodFdlaWdodCA9IGxpZ2h0aW5nX2dldExpZ2h0V2VpZ2h0KFxuICAgICAgcG9zaXRpb25fd29ybGRzcGFjZS54eXosIC8vIHRoZSB3IGNvbXBvbmVudCBpcyBhbHdheXMgMS4wXG4gICAgICBub3JtYWxzXG4gICAgKTtcbiAgfVxuXG4gIHZlYzMgbGlnaHRXZWlnaHRlZENvbG9yID0gbGlnaHRXZWlnaHQgKiBjb2xvci5yZ2I7XG4gIHZDb2xvciA9IHZlYzQobGlnaHRXZWlnaHRlZENvbG9yLCBjb2xvci5hICogb3BhY2l0eSk7XG59XG5gO1xuIl19