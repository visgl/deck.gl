// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext, PreRenderOptions, Viewport} from '@deck.gl/core';
import type {Buffer} from '@luma.gl/core';
import {Model, ShaderInputs} from '@luma.gl/engine';
import {
  ShadowMapRenderer,
  type ShadowCamera,
  type ShadowRenderView,
  type ShadowShaderProps
} from '@luma.gl/experimental';
import type {ShaderModule} from '@luma.gl/shadertools';
import {Matrix4} from '@math.gl/core';
import {CITY_ORIGIN, makeCityMesh, type CityFeature} from '../river-district-data';
import {getRiverfrontSkyLighting} from '../riverfront-sky-lighting';

export type ShadowSettings = {
  hour: number;
  animated: boolean;
  hoursPerSecond: number;
  enabled: boolean;
  softness: number;
  quality: 'low' | 'balanced' | 'cinematic';
};

const casterUniforms = {
  name: 'riverfrontCaster',
  uniformTypes: {viewProjectionMatrix: 'mat4x4<f32>'},
  vs: `layout(std140) uniform riverfrontCasterUniforms { mat4 viewProjectionMatrix; } riverfrontCaster;`,
  source: `struct RiverfrontCasterUniforms { viewProjectionMatrix: mat4x4f };
@group(0) @binding(auto) var<uniform> riverfrontCaster: RiverfrontCasterUniforms;`
} as const satisfies ShaderModule;

/** Fits luma cascades to Deck's camera, with both receivers and casters in local meters. */
export class RiverfrontShadowEffect implements Effect {
  readonly id = 'riverfront-soft-shadows';
  readonly props = {};
  readonly useInPicking = false;
  renderer: ShadowMapRenderer | null = null;
  shadowProps: ShadowShaderProps | null = null;
  viewMatrix = new Matrix4();
  frameCount = 0;
  private vertices: Buffer | null = null;
  private casters: Model[] = [];

  constructor(
    readonly features: readonly CityFeature[],
    readonly settings: ShadowSettings
  ) {}

  setup({device}: EffectContext): void {
    this.renderer = new ShadowMapRenderer(device, {
      quality: this.settings.quality,
      spotLightCapacity: 0,
      pointLightCapacity: 0
    });
    const mesh = makeCityMesh(
      this.features.filter(feature => feature.kind === 'building' || feature.kind === 'bridge')
    );
    this.vertices = device.createBuffer({id: 'riverfront-shadow-casters', data: mesh});
    // Each recorded cascade must retain its own matrix until command submission.
    this.casters = Array.from(
      {length: 4},
      (_, index) =>
        new Model(device, {
          id: `riverfront-caster-${index}`,
          vs: `#version 300 es
in vec3 position;
void main() {
  vec4 clip = riverfrontCaster.viewProjectionMatrix * vec4(position, 1.0);
  gl_Position = vec4(clip.xy, clip.z * 2.0 - clip.w, clip.w);
}`,
          fs: '#version 300 es\nprecision highp float; void main() {}',
          source: `@vertex fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return riverfrontCaster.viewProjectionMatrix * vec4f(position, 1.0);
}
@fragment fn fragmentMain() {}`,
          shaderInputs: new ShaderInputs({riverfrontCaster: casterUniforms}),
          topology: 'triangle-list',
          vertexCount: mesh.length / 10,
          bufferLayout: [
            {
              name: 'vertices',
              byteStride: 40,
              attributes: [{attribute: 'position', format: 'float32x3', byteOffset: 0}]
            }
          ],
          attributes: {vertices: this.vertices!},
          colorAttachmentFormats: [],
          depthStencilAttachmentFormat: 'depth32float',
          parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
        })
    );
  }

  preRender(options: PreRenderOptions): void {
    if (options.isPicking || !this.renderer || !options.viewports[0]) return;
    const camera = getShadowCamera(options.viewports[0]);
    this.viewMatrix = camera.viewMatrix;
    this.renderer.setProps({quality: this.settings.quality});
    const skyLighting = getRiverfrontSkyLighting(this.settings.hour);
    const sunlight = skyLighting.sun.direction[2] > 0;
    this.shadowProps = this.renderer.render({
      camera,
      directionalLights: [
        {
          direction: sunlight ? skyLighting.sun.direction : skyLighting.moonDirection,
          shadowDistance: Math.min(camera.far, 2600),
          casterDistance: 450,
          sourceAngularRadius: Math.max(this.settings.softness, sunlight ? 0 : 0.025),
          cascadeSplitLambda: 0.65,
          cascadeBlendFraction: 0.15,
          normalBias: 0.12,
          depthBias: 2,
          depthBiasSlopeScale: 2,
          strength: this.settings.enabled
            ? sunlight
              ? 1
              : Math.min(0.22, skyLighting.moonIntensity)
            : 0
        }
      ],
      drawShadowCasters: view => this.drawCasters(view)
    });
    this.frameCount++;
  }

  cleanup(): void {
    for (const caster of this.casters) caster.destroy();
    this.casters = [];
    this.vertices?.destroy();
    this.vertices = null;
    this.renderer?.destroy();
    this.renderer = null;
    this.shadowProps = null;
  }

  private drawCasters(view: ShadowRenderView): void {
    const caster = this.casters[view.cascadeIndex ?? 0];
    caster.shaderInputs.setProps({
      riverfrontCaster: {viewProjectionMatrix: view.viewProjectionMatrix}
    });
    caster.setParameters(view.rasterParameters);
    caster.draw(view.renderPass);
  }
}

export function getShadowCamera(viewport: Viewport): ShadowCamera & {viewMatrix: Matrix4} {
  const originCommon = viewport.projectPosition(CITY_ORIGIN);
  const unitsPerMeter = viewport.getDistanceScales(CITY_ORIGIN).unitsPerMeter;
  const viewUnitsPerMeter =
    unitsPerMeter[2] *
    Math.hypot(viewport.viewMatrix[8], viewport.viewMatrix[9], viewport.viewMatrix[10]);
  const viewMatrix = new Matrix4()
    .scale([1 / viewUnitsPerMeter, 1 / viewUnitsPerMeter, 1 / viewUnitsPerMeter])
    .multiplyRight(viewport.viewMatrix)
    .translate(originCommon)
    .scale(unitsPerMeter);
  // Deck uses OpenGL depth; luma's shadow cascade fitting uses WebGPU's [0, 1] clip depth.
  const projectionMatrix = new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 1])
    .multiplyRight(viewport.projectionMatrix)
    .scale(viewUnitsPerMeter);
  const depthScale = viewport.projectionMatrix[10];
  const depthOffset = viewport.projectionMatrix[14] / viewUnitsPerMeter;
  return {
    viewMatrix,
    projectionMatrix,
    clipDepth: 'zero-to-one',
    near: depthOffset / (depthScale - 1),
    far: depthOffset / (depthScale + 1)
  };
}
