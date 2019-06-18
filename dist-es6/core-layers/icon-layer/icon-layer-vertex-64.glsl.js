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

export default "#define SHADER_NAME icon-layer-vertex-shader-64\n\nattribute vec2 positions;\n\nattribute vec3 instancePositions;\nattribute vec2 instancePositions64xyLow;\nattribute float instanceSizes;\nattribute float instanceAngles;\nattribute vec4 instanceColors;\nattribute vec3 instancePickingColors;\nattribute vec4 instanceIconFrames;\nattribute float instanceColorModes;\nattribute vec2 instanceOffsets;\n\nuniform float sizeScale;\nuniform vec2 iconsTextureDim;\n\nvarying float vColorMode;\nvarying vec4 vColor;\nvarying vec2 vTextureCoords;\n\nvec2 rotate_by_angle(vec2 vertex, float angle) {\n  float angle_radian = angle * PI / 180.0;\n  float cos_angle = cos(angle_radian);\n  float sin_angle = sin(angle_radian);\n  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);\n  return rotationMatrix * vertex;\n}\n\nvoid main(void) {\n  vec2 iconSize = instanceIconFrames.zw;\n  // scale icon height to match instanceSize\n  float instanceScale = iconSize.y == 0.0 ? 0.0 : instanceSizes / iconSize.y;\n\n  // scale and rotate vertex in \"pixel\" value and convert back to fraction in clipspace\n  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;\n  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * sizeScale * instanceScale;\n  pixelOffset.y *= -1.0;\n\n  vec4 instancePositions64xy = vec4(\n    instancePositions.x, instancePositions64xyLow.x,\n    instancePositions.y, instancePositions64xyLow.y);\n\n  vec2 projected_coord_xy[2];\n  project_position_fp64(instancePositions64xy, projected_coord_xy);\n\n  vec2 vertex_pos_modelspace[4];\n  vertex_pos_modelspace[0] = projected_coord_xy[0];\n  vertex_pos_modelspace[1] = projected_coord_xy[1];\n  vertex_pos_modelspace[2] = vec2(project_scale(instancePositions.z), 0.0);\n  vertex_pos_modelspace[3] = vec2(1.0, 0.0);\n\n  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);\n  gl_Position += project_pixel_to_clipspace(pixelOffset);\n\n  vTextureCoords = mix(\n    instanceIconFrames.xy,\n    instanceIconFrames.xy + iconSize,\n    (positions.xy + 1.0) / 2.0\n  ) / iconsTextureDim;\n\n  vTextureCoords.y = 1.0 - vTextureCoords.y;\n\n  vColor = instanceColors / 255.;\n\n  vColorMode = instanceColorModes;\n\n  // Set color to be rendered to picking fbo (also used to check for selection highlight).\n  picking_setPickingColor(instancePickingColors);\n}\n";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9pY29uLWxheWVyL2ljb24tbGF5ZXItdmVydGV4LTY0Lmdsc2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiaWNvbi1sYXllci12ZXJ0ZXgtNjQuZ2xzbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5leHBvcnQgZGVmYXVsdCBgXFxcbiNkZWZpbmUgU0hBREVSX05BTUUgaWNvbi1sYXllci12ZXJ0ZXgtc2hhZGVyLTY0XG5cbmF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9ucztcblxuYXR0cmlidXRlIHZlYzMgaW5zdGFuY2VQb3NpdGlvbnM7XG5hdHRyaWJ1dGUgdmVjMiBpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3c7XG5hdHRyaWJ1dGUgZmxvYXQgaW5zdGFuY2VTaXplcztcbmF0dHJpYnV0ZSBmbG9hdCBpbnN0YW5jZUFuZ2xlcztcbmF0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlQ29sb3JzO1xuYXR0cmlidXRlIHZlYzMgaW5zdGFuY2VQaWNraW5nQ29sb3JzO1xuYXR0cmlidXRlIHZlYzQgaW5zdGFuY2VJY29uRnJhbWVzO1xuYXR0cmlidXRlIGZsb2F0IGluc3RhbmNlQ29sb3JNb2RlcztcbmF0dHJpYnV0ZSB2ZWMyIGluc3RhbmNlT2Zmc2V0cztcblxudW5pZm9ybSBmbG9hdCBzaXplU2NhbGU7XG51bmlmb3JtIHZlYzIgaWNvbnNUZXh0dXJlRGltO1xuXG52YXJ5aW5nIGZsb2F0IHZDb2xvck1vZGU7XG52YXJ5aW5nIHZlYzQgdkNvbG9yO1xudmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmRzO1xuXG52ZWMyIHJvdGF0ZV9ieV9hbmdsZSh2ZWMyIHZlcnRleCwgZmxvYXQgYW5nbGUpIHtcbiAgZmxvYXQgYW5nbGVfcmFkaWFuID0gYW5nbGUgKiBQSSAvIDE4MC4wO1xuICBmbG9hdCBjb3NfYW5nbGUgPSBjb3MoYW5nbGVfcmFkaWFuKTtcbiAgZmxvYXQgc2luX2FuZ2xlID0gc2luKGFuZ2xlX3JhZGlhbik7XG4gIG1hdDIgcm90YXRpb25NYXRyaXggPSBtYXQyKGNvc19hbmdsZSwgLXNpbl9hbmdsZSwgc2luX2FuZ2xlLCBjb3NfYW5nbGUpO1xuICByZXR1cm4gcm90YXRpb25NYXRyaXggKiB2ZXJ0ZXg7XG59XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIHZlYzIgaWNvblNpemUgPSBpbnN0YW5jZUljb25GcmFtZXMuenc7XG4gIC8vIHNjYWxlIGljb24gaGVpZ2h0IHRvIG1hdGNoIGluc3RhbmNlU2l6ZVxuICBmbG9hdCBpbnN0YW5jZVNjYWxlID0gaWNvblNpemUueSA9PSAwLjAgPyAwLjAgOiBpbnN0YW5jZVNpemVzIC8gaWNvblNpemUueTtcblxuICAvLyBzY2FsZSBhbmQgcm90YXRlIHZlcnRleCBpbiBcInBpeGVsXCIgdmFsdWUgYW5kIGNvbnZlcnQgYmFjayB0byBmcmFjdGlvbiBpbiBjbGlwc3BhY2VcbiAgdmVjMiBwaXhlbE9mZnNldCA9IHBvc2l0aW9ucyAvIDIuMCAqIGljb25TaXplICsgaW5zdGFuY2VPZmZzZXRzO1xuICBwaXhlbE9mZnNldCA9IHJvdGF0ZV9ieV9hbmdsZShwaXhlbE9mZnNldCwgaW5zdGFuY2VBbmdsZXMpICogc2l6ZVNjYWxlICogaW5zdGFuY2VTY2FsZTtcbiAgcGl4ZWxPZmZzZXQueSAqPSAtMS4wO1xuXG4gIHZlYzQgaW5zdGFuY2VQb3NpdGlvbnM2NHh5ID0gdmVjNChcbiAgICBpbnN0YW5jZVBvc2l0aW9ucy54LCBpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3cueCxcbiAgICBpbnN0YW5jZVBvc2l0aW9ucy55LCBpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3cueSk7XG5cbiAgdmVjMiBwcm9qZWN0ZWRfY29vcmRfeHlbMl07XG4gIHByb2plY3RfcG9zaXRpb25fZnA2NChpbnN0YW5jZVBvc2l0aW9uczY0eHksIHByb2plY3RlZF9jb29yZF94eSk7XG5cbiAgdmVjMiB2ZXJ0ZXhfcG9zX21vZGVsc3BhY2VbNF07XG4gIHZlcnRleF9wb3NfbW9kZWxzcGFjZVswXSA9IHByb2plY3RlZF9jb29yZF94eVswXTtcbiAgdmVydGV4X3Bvc19tb2RlbHNwYWNlWzFdID0gcHJvamVjdGVkX2Nvb3JkX3h5WzFdO1xuICB2ZXJ0ZXhfcG9zX21vZGVsc3BhY2VbMl0gPSB2ZWMyKHByb2plY3Rfc2NhbGUoaW5zdGFuY2VQb3NpdGlvbnMueiksIDAuMCk7XG4gIHZlcnRleF9wb3NfbW9kZWxzcGFjZVszXSA9IHZlYzIoMS4wLCAwLjApO1xuXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdF90b19jbGlwc3BhY2VfZnA2NCh2ZXJ0ZXhfcG9zX21vZGVsc3BhY2UpO1xuICBnbF9Qb3NpdGlvbiArPSBwcm9qZWN0X3BpeGVsX3RvX2NsaXBzcGFjZShwaXhlbE9mZnNldCk7XG5cbiAgdlRleHR1cmVDb29yZHMgPSBtaXgoXG4gICAgaW5zdGFuY2VJY29uRnJhbWVzLnh5LFxuICAgIGluc3RhbmNlSWNvbkZyYW1lcy54eSArIGljb25TaXplLFxuICAgIChwb3NpdGlvbnMueHkgKyAxLjApIC8gMi4wXG4gICkgLyBpY29uc1RleHR1cmVEaW07XG5cbiAgdlRleHR1cmVDb29yZHMueSA9IDEuMCAtIHZUZXh0dXJlQ29vcmRzLnk7XG5cbiAgdkNvbG9yID0gaW5zdGFuY2VDb2xvcnMgLyAyNTUuO1xuXG4gIHZDb2xvck1vZGUgPSBpbnN0YW5jZUNvbG9yTW9kZXM7XG5cbiAgLy8gU2V0IGNvbG9yIHRvIGJlIHJlbmRlcmVkIHRvIHBpY2tpbmcgZmJvIChhbHNvIHVzZWQgdG8gY2hlY2sgZm9yIHNlbGVjdGlvbiBoaWdobGlnaHQpLlxuICBwaWNraW5nX3NldFBpY2tpbmdDb2xvcihpbnN0YW5jZVBpY2tpbmdDb2xvcnMpO1xufVxuYDtcbiJdfQ==