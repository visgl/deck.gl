// Copyright (c) 2016 Uber Technologies, Inc.
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

export const DEFAULT_LIGHTING = {
  enable: true,
  ambient: {r: 1.0, g: 1.0, b: 1.0},
  points: [{
    diffuse: {r: 0.8, g: 0.8, b: 0.8},
    specular: {r: 0.6, g: 0.6, b: 0.6},
    position: [0.5, 0.5, 3]
  }]
};

export const DEFAULT_BACKGROUND_COLOR = {r: 0, g: 0, b: 0, a: 0};

export const DEFAULT_BLENDING = {
  enable: true,
  blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
  blendEquation: 'FUNC_ADD'
};
