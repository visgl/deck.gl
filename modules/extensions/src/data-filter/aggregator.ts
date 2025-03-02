// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Device, DeviceFeature, Framebuffer, RenderPipelineParameters} from '@luma.gl/core';
import {Model, ModelProps} from '@luma.gl/engine';

const AGGREGATE_VS = `\
#version 300 es
#define SHADER_NAME data-filter-vertex-shader

#ifdef FLOAT_TARGET
  in float filterIndices;
  in float filterPrevIndices;
#else
  in vec2 filterIndices;
  in vec2 filterPrevIndices;
#endif

out vec4 vColor;
const float component = 1.0 / 255.0;

void main() {
  #ifdef FLOAT_TARGET
    dataFilter_value *= float(filterIndices != filterPrevIndices);
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    vColor = vec4(0.0, 0.0, 0.0, 1.0);
  #else
    // Float texture is not supported: pack result into 4 channels x 256 px x 64px
    dataFilter_value *= float(filterIndices.x != filterPrevIndices.x);
    float col = filterIndices.x;
    float row = filterIndices.y * 4.0;
    float channel = floor(row);
    row = fract(row);
    vColor = component * vec4(bvec4(channel == 0.0, channel == 1.0, channel == 2.0, channel == 3.0));
    gl_Position = vec4(col * 2.0 - 1.0, row * 2.0 - 1.0, 0.0, 1.0);
  #endif
  gl_PointSize = 1.0;
}
`;

const AGGREGATE_FS = `\
#version 300 es
#define SHADER_NAME data-filter-fragment-shader
precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main() {
  if (dataFilter_value < 0.5) {
    discard;
  }
  fragColor = vColor;
}
`;

const FLOAT_TARGET_FEATURES: DeviceFeature[] = [
  'float32-renderable-webgl', // ability to render to float texture
  'texture-blend-float-webgl' // ability to blend when rendering to float texture
];

export function supportsFloatTarget(device: Device): boolean {
  return FLOAT_TARGET_FEATURES.every(feature => device.features.has(feature));
}

// A 1x1 framebuffer object that encodes the total count of filtered items
export function getFramebuffer(device: Device, useFloatTarget: boolean): Framebuffer {
  if (useFloatTarget) {
    return device.createFramebuffer({
      width: 1,
      height: 1,
      colorAttachments: [
        device.createTexture({
          format: 'rgba32float',
          mipmaps: false
        })
      ]
    });
  }
  return device.createFramebuffer({
    width: 256,
    height: 64,
    colorAttachments: [device.createTexture({format: 'rgba8unorm', mipmaps: false})]
  });
}

// Increments the counter based on dataFilter_value
export function getModel(
  device: Device,
  bufferLayout: ModelProps['bufferLayout'],
  shaderOptions: any,
  useFloatTarget: boolean
): Model {
  shaderOptions.defines.NON_INSTANCED_MODEL = 1;
  if (useFloatTarget) {
    shaderOptions.defines.FLOAT_TARGET = 1;
  }

  return new Model(device, {
    id: 'data-filter-aggregation-model',
    vertexCount: 1,
    isInstanced: false,
    topology: 'point-list',
    disableWarnings: true,
    vs: AGGREGATE_VS,
    fs: AGGREGATE_FS,
    bufferLayout,
    ...shaderOptions
  });
}

export const parameters: RenderPipelineParameters = {
  blend: true,
  blendColorSrcFactor: 'one',
  blendColorDstFactor: 'one',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one',
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  depthCompare: 'never'
} as const;
