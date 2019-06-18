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
#define SHADER_NAME advanced-text-layer-fragment-shader

precision highp float;

uniform float opacity;
uniform float smoothing;
uniform sampler2D iconsTexture;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;

void main(void) {
  float distance = texture2D(iconsTexture, vTextureCoords).a;
  float alpha = smoothstep(0.5 - smoothing, 0.5 + smoothing, distance);
  gl_FragColor = vec4(vColor.rgb, vColor.a * alpha * opacity);

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hZHZhbmNlZC10ZXh0LWxheWVyL2FkdmFuY2VkLXRleHQtbGF5ZXItZnJhZ21lbnQuZ2xzbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLGVBQWdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuZXhwb3J0IGRlZmF1bHQgYFxcXG4jZGVmaW5lIFNIQURFUl9OQU1FIGFkdmFuY2VkLXRleHQtbGF5ZXItZnJhZ21lbnQtc2hhZGVyXG5cbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxudW5pZm9ybSBmbG9hdCBvcGFjaXR5O1xudW5pZm9ybSBmbG9hdCBzbW9vdGhpbmc7XG51bmlmb3JtIHNhbXBsZXIyRCBpY29uc1RleHR1cmU7XG5cbnZhcnlpbmcgZmxvYXQgdkNvbG9yTW9kZTtcbnZhcnlpbmcgdmVjNCB2Q29sb3I7XG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZHM7XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIGZsb2F0IGRpc3RhbmNlID0gdGV4dHVyZTJEKGljb25zVGV4dHVyZSwgdlRleHR1cmVDb29yZHMpLmE7XG4gIGZsb2F0IGFscGhhID0gc21vb3Roc3RlcCgwLjUgLSBzbW9vdGhpbmcsIDAuNSArIHNtb290aGluZywgZGlzdGFuY2UpO1xuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvci5yZ2IsIHZDb2xvci5hICogYWxwaGEgKiBvcGFjaXR5KTtcblxuICAvLyB1c2UgaGlnaGxpZ2h0IGNvbG9yIGlmIHRoaXMgZnJhZ21lbnQgYmVsb25ncyB0byB0aGUgc2VsZWN0ZWQgb2JqZWN0LlxuICBnbF9GcmFnQ29sb3IgPSBwaWNraW5nX2ZpbHRlckhpZ2hsaWdodENvbG9yKGdsX0ZyYWdDb2xvcik7XG5cbiAgLy8gdXNlIHBpY2tpbmcgY29sb3IgaWYgcmVuZGVyaW5nIHRvIHBpY2tpbmcgRkJPLlxuICBnbF9GcmFnQ29sb3IgPSBwaWNraW5nX2ZpbHRlclBpY2tpbmdDb2xvcihnbF9GcmFnQ29sb3IpO1xufVxuYDtcbiJdfQ==