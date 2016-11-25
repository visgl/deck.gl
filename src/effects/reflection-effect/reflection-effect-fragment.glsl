// Copyright (c) 2015 Uber Technologies, Inc.
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

/* fragment shader for the grid-layer */
#define SHADER_NAME reflection-effect-fs

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D reflectionTexture;

varying vec2 uv;
/*
float grid(vec2 xy) {
  #define GRID_SIZE (1.0 / 8.0)
  xy.x = mod(xy.x, GRID_SIZE) / GRID_SIZE;
  xy.y = mod(xy.y, GRID_SIZE) / GRID_SIZE;
  if (xy.x < 0.25 || xy.y < 0.25) {
    return 1.0;
  } else {
    return 1.0;
  }
  
}
*/
void main(void) {
  gl_FragColor = texture2D(reflectionTexture, vec2(uv.x, 1. - uv.y));
}
