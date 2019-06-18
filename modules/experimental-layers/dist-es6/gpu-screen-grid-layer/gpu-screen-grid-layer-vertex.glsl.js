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
#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6

in vec3 vertices;
in vec3 instancePositions;
in vec4 instanceCounts;
in vec3 instancePickingColors;

layout(std140) uniform;
uniform float opacity;
uniform vec3 cellScale;
uniform vec4 minColor;
uniform vec4 maxColor;
uniform AggregationData
{
  vec4 maxCount;
} aggregationData;

uniform vec4 colorRange[RANGE_COUNT];
uniform vec2 colorDomain;
uniform bool shouldUseMinMax;

out vec4 vColor;

vec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {
  vec4 outColor = vec4(0., 0., 0., 0.);
  if (value >= domain.x && value <= domain.y) {
    float domainRange = domain.y - domain.x;
    if (domainRange <= 0.) {
      outColor = colorRange[0];
    } else {
      float rangeCount = float(RANGE_COUNT);
      float rangeStep = domainRange / rangeCount;
      float idx = floor((value - domain.x) / rangeStep);
      idx = clamp(idx, 0., rangeCount - 1.);
      int intIdx = int(idx);
      outColor = colorRange[intIdx];
    }
  }
  outColor = outColor / 255.;
  return outColor;
}

void main(void) {
  float weight = instanceCounts.g ;
  float maxWeight = aggregationData.maxCount.w;
  float step = weight / maxWeight;
  vec4 minMaxColor = mix(minColor, maxColor, step) / 255.;

  vec2 domain = colorDomain;
  float domainMaxValid = float(colorDomain.y != 0.);
  domain.y = mix(maxWeight, colorDomain.y, domainMaxValid);
  vec4 rangeColor = quantizeScale(domain, colorRange, weight);

  float rangeMinMax = float(shouldUseMinMax);
  vec4 color = mix(rangeColor, minMaxColor, rangeMinMax);
  vColor = vec4(color.rgb, color.a * opacity);

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);

  gl_Position = vec4(instancePositions + vertices * cellScale, 1.);
}
`;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncHUtc2NyZWVuLWdyaWQtbGF5ZXIvZ3B1LXNjcmVlbi1ncmlkLWxheWVyLXZlcnRleC5nbHNsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsZUFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmV4cG9ydCBkZWZhdWx0IGBcXFxuI3ZlcnNpb24gMzAwIGVzXG4jZGVmaW5lIFNIQURFUl9OQU1FIHNjcmVlbi1ncmlkLWxheWVyLXZlcnRleC1zaGFkZXJcbiNkZWZpbmUgUkFOR0VfQ09VTlQgNlxuXG5pbiB2ZWMzIHZlcnRpY2VzO1xuaW4gdmVjMyBpbnN0YW5jZVBvc2l0aW9ucztcbmluIHZlYzQgaW5zdGFuY2VDb3VudHM7XG5pbiB2ZWMzIGluc3RhbmNlUGlja2luZ0NvbG9ycztcblxubGF5b3V0KHN0ZDE0MCkgdW5pZm9ybTtcbnVuaWZvcm0gZmxvYXQgb3BhY2l0eTtcbnVuaWZvcm0gdmVjMyBjZWxsU2NhbGU7XG51bmlmb3JtIHZlYzQgbWluQ29sb3I7XG51bmlmb3JtIHZlYzQgbWF4Q29sb3I7XG51bmlmb3JtIEFnZ3JlZ2F0aW9uRGF0YVxue1xuICB2ZWM0IG1heENvdW50O1xufSBhZ2dyZWdhdGlvbkRhdGE7XG5cbnVuaWZvcm0gdmVjNCBjb2xvclJhbmdlW1JBTkdFX0NPVU5UXTtcbnVuaWZvcm0gdmVjMiBjb2xvckRvbWFpbjtcbnVuaWZvcm0gYm9vbCBzaG91bGRVc2VNaW5NYXg7XG5cbm91dCB2ZWM0IHZDb2xvcjtcblxudmVjNCBxdWFudGl6ZVNjYWxlKHZlYzIgZG9tYWluLCB2ZWM0IHJhbmdlW1JBTkdFX0NPVU5UXSwgZmxvYXQgdmFsdWUpIHtcbiAgdmVjNCBvdXRDb2xvciA9IHZlYzQoMC4sIDAuLCAwLiwgMC4pO1xuICBpZiAodmFsdWUgPj0gZG9tYWluLnggJiYgdmFsdWUgPD0gZG9tYWluLnkpIHtcbiAgICBmbG9hdCBkb21haW5SYW5nZSA9IGRvbWFpbi55IC0gZG9tYWluLng7XG4gICAgaWYgKGRvbWFpblJhbmdlIDw9IDAuKSB7XG4gICAgICBvdXRDb2xvciA9IGNvbG9yUmFuZ2VbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsb2F0IHJhbmdlQ291bnQgPSBmbG9hdChSQU5HRV9DT1VOVCk7XG4gICAgICBmbG9hdCByYW5nZVN0ZXAgPSBkb21haW5SYW5nZSAvIHJhbmdlQ291bnQ7XG4gICAgICBmbG9hdCBpZHggPSBmbG9vcigodmFsdWUgLSBkb21haW4ueCkgLyByYW5nZVN0ZXApO1xuICAgICAgaWR4ID0gY2xhbXAoaWR4LCAwLiwgcmFuZ2VDb3VudCAtIDEuKTtcbiAgICAgIGludCBpbnRJZHggPSBpbnQoaWR4KTtcbiAgICAgIG91dENvbG9yID0gY29sb3JSYW5nZVtpbnRJZHhdO1xuICAgIH1cbiAgfVxuICBvdXRDb2xvciA9IG91dENvbG9yIC8gMjU1LjtcbiAgcmV0dXJuIG91dENvbG9yO1xufVxuXG52b2lkIG1haW4odm9pZCkge1xuICBmbG9hdCB3ZWlnaHQgPSBpbnN0YW5jZUNvdW50cy5nIDtcbiAgZmxvYXQgbWF4V2VpZ2h0ID0gYWdncmVnYXRpb25EYXRhLm1heENvdW50Lnc7XG4gIGZsb2F0IHN0ZXAgPSB3ZWlnaHQgLyBtYXhXZWlnaHQ7XG4gIHZlYzQgbWluTWF4Q29sb3IgPSBtaXgobWluQ29sb3IsIG1heENvbG9yLCBzdGVwKSAvIDI1NS47XG5cbiAgdmVjMiBkb21haW4gPSBjb2xvckRvbWFpbjtcbiAgZmxvYXQgZG9tYWluTWF4VmFsaWQgPSBmbG9hdChjb2xvckRvbWFpbi55ICE9IDAuKTtcbiAgZG9tYWluLnkgPSBtaXgobWF4V2VpZ2h0LCBjb2xvckRvbWFpbi55LCBkb21haW5NYXhWYWxpZCk7XG4gIHZlYzQgcmFuZ2VDb2xvciA9IHF1YW50aXplU2NhbGUoZG9tYWluLCBjb2xvclJhbmdlLCB3ZWlnaHQpO1xuXG4gIGZsb2F0IHJhbmdlTWluTWF4ID0gZmxvYXQoc2hvdWxkVXNlTWluTWF4KTtcbiAgdmVjNCBjb2xvciA9IG1peChyYW5nZUNvbG9yLCBtaW5NYXhDb2xvciwgcmFuZ2VNaW5NYXgpO1xuICB2Q29sb3IgPSB2ZWM0KGNvbG9yLnJnYiwgY29sb3IuYSAqIG9wYWNpdHkpO1xuXG4gIC8vIFNldCBjb2xvciB0byBiZSByZW5kZXJlZCB0byBwaWNraW5nIGZibyAoYWxzbyB1c2VkIHRvIGNoZWNrIGZvciBzZWxlY3Rpb24gaGlnaGxpZ2h0KS5cbiAgcGlja2luZ19zZXRQaWNraW5nQ29sb3IoaW5zdGFuY2VQaWNraW5nQ29sb3JzKTtcblxuICBnbF9Qb3NpdGlvbiA9IHZlYzQoaW5zdGFuY2VQb3NpdGlvbnMgKyB2ZXJ0aWNlcyAqIGNlbGxTY2FsZSwgMS4pO1xufVxuYDtcbiJdfQ==