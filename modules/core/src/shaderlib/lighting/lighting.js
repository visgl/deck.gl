// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

import LightingEffect from '../../experimental/lighting-effect/lighting-effect';
import lightingShader from './lighting.glsl';

export default {
  name: 'lighting',
  vs: lightingShader,
  getUniforms
};

const INITIAL_MODULE_OPTIONS = {};

function getLightSourceUniforms(lightEffect) {
  const lightSourceUniforms = {};

  if (lightEffect.ambientLight) {
    lightSourceUniforms['lighting_ambientLight.color'] = lightEffect.ambientLight.color;
    lightSourceUniforms['lighting_ambientLight.intensity'] = lightEffect.ambientLight.intensity;
  }

  let index = 0;
  for (const i in lightEffect.pointLights) {
    const pointLight = lightEffect.pointLights[i];
    lightSourceUniforms[`lighting_pointLight[${index}].color`] = pointLight.color;
    lightSourceUniforms[`lighting_pointLight[${index}].intensity`] = pointLight.intensity;
    lightSourceUniforms[`lighting_pointLight[${index}].position`] = pointLight.position;
    index++;
  }
  lightSourceUniforms.lighting_pointLightNumber = index;

  for (const i in lightEffect.directionalLights) {
    const directionalLight = lightEffect.directionalLights[i];
    lightSourceUniforms[`lighting_directionalLight[${index}].color`] = directionalLight.color;
    lightSourceUniforms[`lighting_directionalLight[${index}].intensity`] =
      directionalLight.intensity;
    lightSourceUniforms[`lighting_directionalLight[${index}].direction`] =
      directionalLight.direction;
    index++;
  }
  lightSourceUniforms.lighting_directionalLightNumber = lightEffect.directionalLights.length;

  return lightSourceUniforms;
}

function getMaterialUniforms(material) {
  const materialUniforms = {};
  materialUniforms.lighting_ambient = material.ambient;
  materialUniforms.lighting_diffuse = material.diffuse;
  materialUniforms.lighting_shininess = material.shininess;
  materialUniforms.lighting_specularColor = material.specularColor;
  return materialUniforms;
}

function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  let lightEffect;
  if (opts.effects && Array.isArray(opts.effects)) {
    for (const i in opts.effects) {
      const effect = opts.effects[i];
      if (effect instanceof LightingEffect) {
        lightEffect = effect;
        break;
      }
    }
  }

  if (!lightEffect || !opts.material) {
    return {};
  }

  const lightUniforms = Object.assign(
    {},
    getLightSourceUniforms(lightEffect),
    getMaterialUniforms(opts.material)
  );

  return lightUniforms;
}
