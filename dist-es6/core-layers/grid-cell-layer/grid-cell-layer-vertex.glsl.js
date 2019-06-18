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

export default "#define SHADER_NAME grid-cell-layer-vertex-shader\n\nattribute vec3 positions;\nattribute vec3 normals;\n\nattribute vec4 instancePositions;\nattribute vec4 instanceColors;\nattribute vec3 instancePickingColors;\n\n// Custom uniforms\nuniform float extruded;\nuniform float cellSize;\nuniform float coverage;\nuniform float opacity;\nuniform float elevationScale;\n\n// A magic number to scale elevation so that 1 unit approximate to 1 meter\n#define ELEVATION_SCALE 0.8\n\n// Result\nvarying vec4 vColor;\n\nvoid main(void) {\n\n  vec2 topLeftPos = project_position(instancePositions.xy);\n\n  // if ahpha == 0.0 or z < 0.0, do not render element\n  float noRender = float(instanceColors.a == 0.0 || instancePositions.w < 0.0);\n  float finalCellSize = cellSize * mix(1.0, 0.0, noRender);\n\n  // cube gemoetry vertics are between -1 to 1, scale and transform it to between 0, 1\n  vec2 pos = topLeftPos + vec2(\n  (positions.x * coverage + 1.0) / 2.0 * finalCellSize,\n  (positions.y * coverage - 1.0) / 2.0 * finalCellSize);\n\n  float elevation = 0.0;\n\n  if (extruded > 0.5) {\n    elevation = project_scale(instancePositions.w  * (positions.z + 1.0) *\n      ELEVATION_SCALE * elevationScale);\n  }\n\n  // extrude positions\n  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0);\n  vec4 position_worldspace = vec4(extrudedPosition, 1.0);\n  gl_Position = project_to_clipspace(position_worldspace);\n\n  float lightWeight = 1.0;\n\n  if (extruded > 0.5) {\n    lightWeight = getLightWeight(\n      position_worldspace.xyz, // the w component is always 1.0\n      normals\n    );\n  }\n\n  vec3 lightWeightedColor = lightWeight * instanceColors.rgb;\n  vec4 color = vec4(lightWeightedColor, instanceColors.a * opacity) / 255.0;\n  vColor = color;\n\n  // Set color to be rendered to picking fbo (also used to check for selection highlight).\n  picking_setPickingColor(instancePickingColors);\n}\n";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9ncmlkLWNlbGwtbGF5ZXIvZ3JpZC1jZWxsLWxheWVyLXZlcnRleC5nbHNsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBIiwiZmlsZSI6ImdyaWQtY2VsbC1sYXllci12ZXJ0ZXguZ2xzbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyBJbnNwaXJlZCBieSBzY3JlZW4tZ3JpZC1sYXllciB2ZXJ0ZXggc2hhZGVyIGluIGRlY2suZ2xcblxuZXhwb3J0IGRlZmF1bHQgYFxcXG4jZGVmaW5lIFNIQURFUl9OQU1FIGdyaWQtY2VsbC1sYXllci12ZXJ0ZXgtc2hhZGVyXG5cbmF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9ucztcbmF0dHJpYnV0ZSB2ZWMzIG5vcm1hbHM7XG5cbmF0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlUG9zaXRpb25zO1xuYXR0cmlidXRlIHZlYzQgaW5zdGFuY2VDb2xvcnM7XG5hdHRyaWJ1dGUgdmVjMyBpbnN0YW5jZVBpY2tpbmdDb2xvcnM7XG5cbi8vIEN1c3RvbSB1bmlmb3Jtc1xudW5pZm9ybSBmbG9hdCBleHRydWRlZDtcbnVuaWZvcm0gZmxvYXQgY2VsbFNpemU7XG51bmlmb3JtIGZsb2F0IGNvdmVyYWdlO1xudW5pZm9ybSBmbG9hdCBvcGFjaXR5O1xudW5pZm9ybSBmbG9hdCBlbGV2YXRpb25TY2FsZTtcblxuLy8gQSBtYWdpYyBudW1iZXIgdG8gc2NhbGUgZWxldmF0aW9uIHNvIHRoYXQgMSB1bml0IGFwcHJveGltYXRlIHRvIDEgbWV0ZXJcbiNkZWZpbmUgRUxFVkFUSU9OX1NDQUxFIDAuOFxuXG4vLyBSZXN1bHRcbnZhcnlpbmcgdmVjNCB2Q29sb3I7XG5cbnZvaWQgbWFpbih2b2lkKSB7XG5cbiAgdmVjMiB0b3BMZWZ0UG9zID0gcHJvamVjdF9wb3NpdGlvbihpbnN0YW5jZVBvc2l0aW9ucy54eSk7XG5cbiAgLy8gaWYgYWhwaGEgPT0gMC4wIG9yIHogPCAwLjAsIGRvIG5vdCByZW5kZXIgZWxlbWVudFxuICBmbG9hdCBub1JlbmRlciA9IGZsb2F0KGluc3RhbmNlQ29sb3JzLmEgPT0gMC4wIHx8IGluc3RhbmNlUG9zaXRpb25zLncgPCAwLjApO1xuICBmbG9hdCBmaW5hbENlbGxTaXplID0gY2VsbFNpemUgKiBtaXgoMS4wLCAwLjAsIG5vUmVuZGVyKTtcblxuICAvLyBjdWJlIGdlbW9ldHJ5IHZlcnRpY3MgYXJlIGJldHdlZW4gLTEgdG8gMSwgc2NhbGUgYW5kIHRyYW5zZm9ybSBpdCB0byBiZXR3ZWVuIDAsIDFcbiAgdmVjMiBwb3MgPSB0b3BMZWZ0UG9zICsgdmVjMihcbiAgKHBvc2l0aW9ucy54ICogY292ZXJhZ2UgKyAxLjApIC8gMi4wICogZmluYWxDZWxsU2l6ZSxcbiAgKHBvc2l0aW9ucy55ICogY292ZXJhZ2UgLSAxLjApIC8gMi4wICogZmluYWxDZWxsU2l6ZSk7XG5cbiAgZmxvYXQgZWxldmF0aW9uID0gMC4wO1xuXG4gIGlmIChleHRydWRlZCA+IDAuNSkge1xuICAgIGVsZXZhdGlvbiA9IHByb2plY3Rfc2NhbGUoaW5zdGFuY2VQb3NpdGlvbnMudyAgKiAocG9zaXRpb25zLnogKyAxLjApICpcbiAgICAgIEVMRVZBVElPTl9TQ0FMRSAqIGVsZXZhdGlvblNjYWxlKTtcbiAgfVxuXG4gIC8vIGV4dHJ1ZGUgcG9zaXRpb25zXG4gIHZlYzMgZXh0cnVkZWRQb3NpdGlvbiA9IHZlYzMocG9zLnh5LCBlbGV2YXRpb24gKyAxLjApO1xuICB2ZWM0IHBvc2l0aW9uX3dvcmxkc3BhY2UgPSB2ZWM0KGV4dHJ1ZGVkUG9zaXRpb24sIDEuMCk7XG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdF90b19jbGlwc3BhY2UocG9zaXRpb25fd29ybGRzcGFjZSk7XG5cbiAgZmxvYXQgbGlnaHRXZWlnaHQgPSAxLjA7XG5cbiAgaWYgKGV4dHJ1ZGVkID4gMC41KSB7XG4gICAgbGlnaHRXZWlnaHQgPSBnZXRMaWdodFdlaWdodChcbiAgICAgIHBvc2l0aW9uX3dvcmxkc3BhY2UueHl6LCAvLyB0aGUgdyBjb21wb25lbnQgaXMgYWx3YXlzIDEuMFxuICAgICAgbm9ybWFsc1xuICAgICk7XG4gIH1cblxuICB2ZWMzIGxpZ2h0V2VpZ2h0ZWRDb2xvciA9IGxpZ2h0V2VpZ2h0ICogaW5zdGFuY2VDb2xvcnMucmdiO1xuICB2ZWM0IGNvbG9yID0gdmVjNChsaWdodFdlaWdodGVkQ29sb3IsIGluc3RhbmNlQ29sb3JzLmEgKiBvcGFjaXR5KSAvIDI1NS4wO1xuICB2Q29sb3IgPSBjb2xvcjtcblxuICAvLyBTZXQgY29sb3IgdG8gYmUgcmVuZGVyZWQgdG8gcGlja2luZyBmYm8gKGFsc28gdXNlZCB0byBjaGVjayBmb3Igc2VsZWN0aW9uIGhpZ2hsaWdodCkuXG4gIHBpY2tpbmdfc2V0UGlja2luZ0NvbG9yKGluc3RhbmNlUGlja2luZ0NvbG9ycyk7XG59XG5gO1xuIl19