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

// get current blending settings
export function getBlendMode(gl) {
  return {
    enabled: gl.getParameter(gl.BLEND),
    equationRGB: gl.getParameter(gl.BLEND_EQUATION_RGB),
    equationAlpha: gl.getParameter(gl.BLEND_EQUATION_ALPHA),
    srcRGB: gl.getParameter(gl.BLEND_SRC_RGB),
    dstRGB: gl.getParameter(gl.BLEND_DST_RGB),
    srcAlpha: gl.getParameter(gl.BLEND_SRC_ALPHA),
    dstAlpha: gl.getParameter(gl.BLEND_DST_ALPHA)
  };
}

// apply blending settings
export function setBlendMode(gl, settings) {
  if (settings.enabled) {
    gl.enable(gl.BLEND);
  } else {
    gl.disable(gl.BLEND);
  }
  gl.blendEquationSeparate(settings.equationRGB, settings.equationAlpha);
  gl.blendFuncSeparate(settings.srcRGB, settings.dstRGB, settings.srcAlpha, settings.dstAlpha);
}
