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

import lightingShader from './lighting.glsl';
import project from '../project/project';

const INITIAL_MODULE_OPTIONS = {};

const DEFAULT_LIGHTS_POSITION = [-122.45, 37.75, 8000, -122.0, 38.0, 5000];
const DEFAULT_AMBIENT_RATIO = 0.05;
const DEFAULT_DIFFUSE_RATIO = 0.6;
const DEFAULT_SPECULAR_RATIO = 0.8;
const DEFAULT_LIGHTS_STRENGTH = [2.0, 0.0, 0.0, 0.0];

export default {
  name: 'lighting',
  dependencies: [project],
  vs: lightingShader,
  getUniforms: (opts = INITIAL_MODULE_OPTIONS) => {
    if (opts.lightSettings) {
      const {
        lightsPosition = DEFAULT_LIGHTS_POSITION,
        ambientRatio = DEFAULT_AMBIENT_RATIO,
        diffuseRatio = DEFAULT_DIFFUSE_RATIO,
        specularRatio = DEFAULT_SPECULAR_RATIO,
        lightsStrength = DEFAULT_LIGHTS_STRENGTH
        // numberOfLights = 2
      } = opts.lightSettings;

      return {
        lightsPosition,
        ambientRatio,
        diffuseRatio,
        specularRatio,
        lightsStrength
      };
    }

    return {};
  }
};
