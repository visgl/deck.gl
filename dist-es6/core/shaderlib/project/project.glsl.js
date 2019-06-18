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

export default "// EXTERNAL CONSTANTS: these must match JavaScript constants in \"src/lib/constants.js\"\nconst float COORDINATE_SYSTEM_IDENTITY = 0.;\nconst float COORDINATE_SYSTEM_LNG_LAT = 1.;\nconst float COORDINATE_SYSTEM_METER_OFFSETS = 2.;\n\nuniform float project_uCoordinateSystem;\nuniform float project_uScale;\nuniform vec3 project_uPixelsPerUnit;\nuniform vec4 project_uCenter;\nuniform mat4 project_uModelMatrix;\nuniform mat4 project_uViewProjectionMatrix;\nuniform vec2 project_uViewportSize;\nuniform float project_uDevicePixelRatio;\nuniform float project_uFocalDistance;\nuniform vec3 project_uCameraPosition;\n\nconst float TILE_SIZE = 512.0;\nconst float PI = 3.1415926536;\nconst float WORLD_SCALE = TILE_SIZE / (PI * 2.0);\n\n//\n// Scaling offsets - scales meters to \"pixels\"\n// Note the scalar version of project_scale is for scaling the z component only\n//\nfloat project_scale(float meters) {\n  return meters * project_uPixelsPerUnit.z;\n}\n\nvec2 project_scale(vec2 meters) {\n  return meters * project_uPixelsPerUnit.xy;\n}\n\nvec3 project_scale(vec3 meters) {\n  return vec3(project_scale(meters.xy), project_scale(meters.z));\n}\n\nvec4 project_scale(vec4 meters) {\n  return vec4(project_scale(meters.xyz), meters.w);\n}\n\n//\n// Projecting positions - non-linear projection: lnglats => unit tile [0-1, 0-1]\n//\nvec2 project_mercator_(vec2 lnglat) {\n  return vec2(\n    radians(lnglat.x) + PI,\n    PI - log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5))\n  );\n}\n\n//\n// Projects lnglats (or meter offsets, depending on mode) to pixels\n//\nvec4 project_position(vec4 position) {\n  // TODO - why not simply subtract center and fall through?\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNG_LAT) {\n    return project_uModelMatrix * vec4(\n      project_mercator_(position.xy) * WORLD_SCALE * project_uScale,\n      project_scale(position.z),\n      position.w\n    );\n  }\n\n  // Apply model matrix\n  vec4 position_modelspace = project_uModelMatrix * position;\n  return project_scale(position_modelspace);\n}\n\nvec3 project_position(vec3 position) {\n  vec4 projected_position = project_position(vec4(position, 1.0));\n  return projected_position.xyz;\n}\n\nvec2 project_position(vec2 position) {\n  vec4 projected_position = project_position(vec4(position, 0.0, 1.0));\n  return projected_position.xy;\n}\n\n//\n// Projects from \"world\" coordinates to clip space.\n// Uses project_uViewProjectionMatrix\n//\nvec4 project_to_clipspace(vec4 position) {\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS) {\n    // Needs to be divided with project_uPixelsPerUnit\n    position.w *= project_uPixelsPerUnit.z;\n  }\n  return project_uViewProjectionMatrix * position + project_uCenter;\n}\n\n// Returns a clip space offset that corresponds to a given number of **non-device** pixels\nvec4 project_pixel_to_clipspace(vec2 pixels) {\n  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio;\n  return vec4(offset * project_uFocalDistance, 0.0, 0.0);\n}\n";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL3NoYWRlcmxpYi9wcm9qZWN0L3Byb2plY3QuZ2xzbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsImZpbGUiOiJwcm9qZWN0Lmdsc2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuZXhwb3J0IGRlZmF1bHQgYFxcXG4vLyBFWFRFUk5BTCBDT05TVEFOVFM6IHRoZXNlIG11c3QgbWF0Y2ggSmF2YVNjcmlwdCBjb25zdGFudHMgaW4gXCJzcmMvbGliL2NvbnN0YW50cy5qc1wiXG5jb25zdCBmbG9hdCBDT09SRElOQVRFX1NZU1RFTV9JREVOVElUWSA9IDAuO1xuY29uc3QgZmxvYXQgQ09PUkRJTkFURV9TWVNURU1fTE5HX0xBVCA9IDEuO1xuY29uc3QgZmxvYXQgQ09PUkRJTkFURV9TWVNURU1fTUVURVJfT0ZGU0VUUyA9IDIuO1xuXG51bmlmb3JtIGZsb2F0IHByb2plY3RfdUNvb3JkaW5hdGVTeXN0ZW07XG51bmlmb3JtIGZsb2F0IHByb2plY3RfdVNjYWxlO1xudW5pZm9ybSB2ZWMzIHByb2plY3RfdVBpeGVsc1BlclVuaXQ7XG51bmlmb3JtIHZlYzQgcHJvamVjdF91Q2VudGVyO1xudW5pZm9ybSBtYXQ0IHByb2plY3RfdU1vZGVsTWF0cml4O1xudW5pZm9ybSBtYXQ0IHByb2plY3RfdVZpZXdQcm9qZWN0aW9uTWF0cml4O1xudW5pZm9ybSB2ZWMyIHByb2plY3RfdVZpZXdwb3J0U2l6ZTtcbnVuaWZvcm0gZmxvYXQgcHJvamVjdF91RGV2aWNlUGl4ZWxSYXRpbztcbnVuaWZvcm0gZmxvYXQgcHJvamVjdF91Rm9jYWxEaXN0YW5jZTtcbnVuaWZvcm0gdmVjMyBwcm9qZWN0X3VDYW1lcmFQb3NpdGlvbjtcblxuY29uc3QgZmxvYXQgVElMRV9TSVpFID0gNTEyLjA7XG5jb25zdCBmbG9hdCBQSSA9IDMuMTQxNTkyNjUzNjtcbmNvbnN0IGZsb2F0IFdPUkxEX1NDQUxFID0gVElMRV9TSVpFIC8gKFBJICogMi4wKTtcblxuLy9cbi8vIFNjYWxpbmcgb2Zmc2V0cyAtIHNjYWxlcyBtZXRlcnMgdG8gXCJwaXhlbHNcIlxuLy8gTm90ZSB0aGUgc2NhbGFyIHZlcnNpb24gb2YgcHJvamVjdF9zY2FsZSBpcyBmb3Igc2NhbGluZyB0aGUgeiBjb21wb25lbnQgb25seVxuLy9cbmZsb2F0IHByb2plY3Rfc2NhbGUoZmxvYXQgbWV0ZXJzKSB7XG4gIHJldHVybiBtZXRlcnMgKiBwcm9qZWN0X3VQaXhlbHNQZXJVbml0Lno7XG59XG5cbnZlYzIgcHJvamVjdF9zY2FsZSh2ZWMyIG1ldGVycykge1xuICByZXR1cm4gbWV0ZXJzICogcHJvamVjdF91UGl4ZWxzUGVyVW5pdC54eTtcbn1cblxudmVjMyBwcm9qZWN0X3NjYWxlKHZlYzMgbWV0ZXJzKSB7XG4gIHJldHVybiB2ZWMzKHByb2plY3Rfc2NhbGUobWV0ZXJzLnh5KSwgcHJvamVjdF9zY2FsZShtZXRlcnMueikpO1xufVxuXG52ZWM0IHByb2plY3Rfc2NhbGUodmVjNCBtZXRlcnMpIHtcbiAgcmV0dXJuIHZlYzQocHJvamVjdF9zY2FsZShtZXRlcnMueHl6KSwgbWV0ZXJzLncpO1xufVxuXG4vL1xuLy8gUHJvamVjdGluZyBwb3NpdGlvbnMgLSBub24tbGluZWFyIHByb2plY3Rpb246IGxuZ2xhdHMgPT4gdW5pdCB0aWxlIFswLTEsIDAtMV1cbi8vXG52ZWMyIHByb2plY3RfbWVyY2F0b3JfKHZlYzIgbG5nbGF0KSB7XG4gIHJldHVybiB2ZWMyKFxuICAgIHJhZGlhbnMobG5nbGF0LngpICsgUEksXG4gICAgUEkgLSBsb2codGFuX2ZwMzIoUEkgKiAwLjI1ICsgcmFkaWFucyhsbmdsYXQueSkgKiAwLjUpKVxuICApO1xufVxuXG4vL1xuLy8gUHJvamVjdHMgbG5nbGF0cyAob3IgbWV0ZXIgb2Zmc2V0cywgZGVwZW5kaW5nIG9uIG1vZGUpIHRvIHBpeGVsc1xuLy9cbnZlYzQgcHJvamVjdF9wb3NpdGlvbih2ZWM0IHBvc2l0aW9uKSB7XG4gIC8vIFRPRE8gLSB3aHkgbm90IHNpbXBseSBzdWJ0cmFjdCBjZW50ZXIgYW5kIGZhbGwgdGhyb3VnaD9cbiAgaWYgKHByb2plY3RfdUNvb3JkaW5hdGVTeXN0ZW0gPT0gQ09PUkRJTkFURV9TWVNURU1fTE5HX0xBVCkge1xuICAgIHJldHVybiBwcm9qZWN0X3VNb2RlbE1hdHJpeCAqIHZlYzQoXG4gICAgICBwcm9qZWN0X21lcmNhdG9yXyhwb3NpdGlvbi54eSkgKiBXT1JMRF9TQ0FMRSAqIHByb2plY3RfdVNjYWxlLFxuICAgICAgcHJvamVjdF9zY2FsZShwb3NpdGlvbi56KSxcbiAgICAgIHBvc2l0aW9uLndcbiAgICApO1xuICB9XG5cbiAgLy8gQXBwbHkgbW9kZWwgbWF0cml4XG4gIHZlYzQgcG9zaXRpb25fbW9kZWxzcGFjZSA9IHByb2plY3RfdU1vZGVsTWF0cml4ICogcG9zaXRpb247XG4gIHJldHVybiBwcm9qZWN0X3NjYWxlKHBvc2l0aW9uX21vZGVsc3BhY2UpO1xufVxuXG52ZWMzIHByb2plY3RfcG9zaXRpb24odmVjMyBwb3NpdGlvbikge1xuICB2ZWM0IHByb2plY3RlZF9wb3NpdGlvbiA9IHByb2plY3RfcG9zaXRpb24odmVjNChwb3NpdGlvbiwgMS4wKSk7XG4gIHJldHVybiBwcm9qZWN0ZWRfcG9zaXRpb24ueHl6O1xufVxuXG52ZWMyIHByb2plY3RfcG9zaXRpb24odmVjMiBwb3NpdGlvbikge1xuICB2ZWM0IHByb2plY3RlZF9wb3NpdGlvbiA9IHByb2plY3RfcG9zaXRpb24odmVjNChwb3NpdGlvbiwgMC4wLCAxLjApKTtcbiAgcmV0dXJuIHByb2plY3RlZF9wb3NpdGlvbi54eTtcbn1cblxuLy9cbi8vIFByb2plY3RzIGZyb20gXCJ3b3JsZFwiIGNvb3JkaW5hdGVzIHRvIGNsaXAgc3BhY2UuXG4vLyBVc2VzIHByb2plY3RfdVZpZXdQcm9qZWN0aW9uTWF0cml4XG4vL1xudmVjNCBwcm9qZWN0X3RvX2NsaXBzcGFjZSh2ZWM0IHBvc2l0aW9uKSB7XG4gIGlmIChwcm9qZWN0X3VDb29yZGluYXRlU3lzdGVtID09IENPT1JESU5BVEVfU1lTVEVNX01FVEVSX09GRlNFVFMpIHtcbiAgICAvLyBOZWVkcyB0byBiZSBkaXZpZGVkIHdpdGggcHJvamVjdF91UGl4ZWxzUGVyVW5pdFxuICAgIHBvc2l0aW9uLncgKj0gcHJvamVjdF91UGl4ZWxzUGVyVW5pdC56O1xuICB9XG4gIHJldHVybiBwcm9qZWN0X3VWaWV3UHJvamVjdGlvbk1hdHJpeCAqIHBvc2l0aW9uICsgcHJvamVjdF91Q2VudGVyO1xufVxuXG4vLyBSZXR1cm5zIGEgY2xpcCBzcGFjZSBvZmZzZXQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGdpdmVuIG51bWJlciBvZiAqKm5vbi1kZXZpY2UqKiBwaXhlbHNcbnZlYzQgcHJvamVjdF9waXhlbF90b19jbGlwc3BhY2UodmVjMiBwaXhlbHMpIHtcbiAgdmVjMiBvZmZzZXQgPSBwaXhlbHMgLyBwcm9qZWN0X3VWaWV3cG9ydFNpemUgKiBwcm9qZWN0X3VEZXZpY2VQaXhlbFJhdGlvO1xuICByZXR1cm4gdmVjNChvZmZzZXQgKiBwcm9qZWN0X3VGb2NhbERpc3RhbmNlLCAwLjAsIDAuMCk7XG59XG5gO1xuIl19