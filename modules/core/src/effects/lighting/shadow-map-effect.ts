// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {RenderPipelineParameters} from '@luma.gl/core';
import {
  ShadowMapRenderer,
  type ShadowCamera,
  type ShadowRenderView,
  type ShadowShaderProps
} from '@luma.gl/engine/lighting';
import {shadow} from '@luma.gl/shaders';
import {Matrix4} from '@math.gl/core/matrix';
import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import type {Effect, EffectContext, PreRenderOptions} from '../../lib/effect';
import type Layer from '../../lib/layer';
import LayersPass from '../../passes/layers-pass';
import type Viewport from '../../viewports/viewport';

const shadowMap = {
  name: 'deckShadowMap',
  source: /* wgsl */ `
struct DeckShadowMapUniforms {
  caster: i32,
  matrix: mat4x4f,
  viewMatrix: mat4x4f,
  color: vec4f,
  commonOrigin: vec3f,
  unitsPerMeter: f32,
};
@group(0) @binding(auto) var<uniform> deckShadowMap: DeckShadowMapUniforms;
`,
  dependencies: [shadow],
  uniformTypes: {
    caster: 'i32',
    matrix: 'mat4x4<f32>',
    viewMatrix: 'mat4x4<f32>',
    color: 'vec4<f32>',
    commonOrigin: 'vec3<f32>',
    unitsPerMeter: 'f32'
  }
} as const satisfies ShaderModule;

const plugin: ShaderPlugin = {
  name: 'deckShadowMap',
  module: shadowMap,
  interStageVariables: {
    deckShadowMap_position: {type: 'vec4<f32>'},
    deckShadowMap_normal: {type: 'vec3<f32>'}
  },
  injections: {
    'wgsl:vs:DECKGL_FILTER_GL_POSITION': /* wgsl */ `
if (geometry.position.w != 0.0 && deckShadowMap.unitsPerMeter > 0.0) {
  let centeredPosition = geometry.position.xyz + (project.commonOrigin - deckShadowMap.commonOrigin);
  deckShadowMap_position = vec4f(centeredPosition / deckShadowMap.unitsPerMeter, 1.0);
  deckShadowMap_normal = geometry.normal;
  if (deckShadowMap.caster != 0) {
    *position = deckShadowMap.matrix * deckShadowMap_position;
  }
}
`,
    'wgsl:fs:DECKGL_FILTER_COLOR': /* wgsl */ `
if (deckShadowMap.caster == 0 && deckShadowMap_position.w > 0.0 && shadow.directionalLightCount > 0) {
  let position = deckShadowMap_position;
  let viewDepth = -(deckShadowMap.viewMatrix * position).z;
  let normal = select(vec3f(0.0, 0.0, 1.0), deckShadowMap_normal,
    dot(deckShadowMap_normal, deckShadowMap_normal) > 0.0);
  let visibility = shadow_getDirectionalFactor(position.xyz, normal, viewDepth);
  (*color) = vec4f(mix((*color).rgb, deckShadowMap.color.rgb,
    (1.0 - visibility) * deckShadowMap.color.a), (*color).a);
}
`
  }
};

/** Settings for opt-in WebGPU directional shadow maps. */
export type ShadowMapEffectProps = {
  /** Direction the light travels, in Deck common space. */
  direction: [number, number, number];
  /** Cascaded shadow quality. Defaults to balanced. */
  quality?: 'low' | 'balanced' | 'cinematic';
  /** Shadow tint as normalized RGBA. */
  shadowColor?: [number, number, number, number];
};

/** Renders cascaded directional shadows using luma.gl's ShadowMapRenderer on WebGPU. */
export class ShadowMapEffect implements Effect {
  readonly id = 'deck-shadow-map';
  readonly useInPicking = true;
  private renderer?: ShadowMapRenderer;
  private fallbackRenderer?: ShadowMapRenderer;
  private isPicking = false;
  private passes?: CascadeCasterPass;
  private emptyShadowProps?: ShadowShaderProps;
  private shadowProps?: ShadowShaderProps;
  private camera?: ShadowCamera;
  private viewport?: Viewport;

  constructor(public props: ShadowMapEffectProps) {}

  setup({device, deck}: EffectContext): void {
    if (device.type !== 'webgpu') {
      throw new Error('ShadowMapEffect requires WebGPU');
    }
    this.renderer = new ShadowMapRenderer(device, {
      quality: this.props.quality,
      spotLightCapacity: 0,
      pointLightCapacity: 0,
      spotMapSize: 1,
      pointMapSize: 1
    });
    this.fallbackRenderer = new ShadowMapRenderer(device, {
      directionalMapSize: 1,
      directionalLightCapacity: 0,
      spotLightCapacity: 0,
      pointLightCapacity: 0,
      spotMapSize: 1,
      pointMapSize: 1
    });
    this.emptyShadowProps = this.fallbackRenderer.render({
      camera: {viewMatrix: new Matrix4(), projectionMatrix: new Matrix4(), near: 0.1, far: 1},
      drawShadowCasters: () => {}
    });
    this.passes = new CascadeCasterPass(device);
    deck._addDefaultShaderPlugin(plugin);
  }

  setProps(props: ShadowMapEffectProps): void {
    this.props = props;
    this.renderer?.setProps({quality: props.quality});
  }

  preRender(options: PreRenderOptions): void {
    const viewport = options.viewports[0];
    this.isPicking = Boolean(options.isPicking);
    if (this.isPicking || !this.renderer) return;
    if (!viewport || options.viewports.length !== 1 || viewport.subViewports?.length) {
      this.shadowProps = undefined;
      return;
    }

    const camera = getCamera(viewport);
    this.camera = camera;
    this.viewport = viewport;
    const [x, y, z] = this.props.direction;
    const {device} = this.renderer;
    this.shadowProps = this.renderer.render({
      camera,
      directionalLights: [{direction: [-x, -y, -z]}],
      // Layers update the same uniform buffers for every cascade.
      prepareShadowCasters: () => device.submit(),
      drawShadowCasters: view => this.passes!.draw(view, viewport, options, this.emptyShadowProps!)
    });
    device.submit();
  }

  getShaderModuleProps() {
    return {
      shadow: (this.isPicking ? undefined : this.shadowProps) ?? this.emptyShadowProps,
      deckShadowMap: {
        caster: 0,
        viewMatrix: this.camera?.viewMatrix,
        color: this.props.shadowColor ?? [0, 0, 0, 0.6],
        ...getCommonSpace(this.viewport)
      }
    };
  }

  cleanup({deck}: EffectContext): void {
    this.renderer?.destroy();
    this.fallbackRenderer?.destroy();
    this.renderer = this.fallbackRenderer = undefined;
    this.passes = undefined;
    this.emptyShadowProps = this.shadowProps = undefined;
    this.camera = undefined;
    this.viewport = undefined;
    deck._removeDefaultShaderPlugin(plugin);
  }
}

class CascadeCasterPass extends LayersPass {
  private rasterParameters: Readonly<RenderPipelineParameters> = {};

  draw(
    view: ShadowRenderView,
    viewport: Viewport,
    options: PreRenderOptions,
    emptyShadow: ShadowShaderProps
  ): void {
    this.rasterParameters = view.rasterParameters;
    this._drawIntoPass(view.renderPass, viewport, {
      ...options,
      pass: 'shadow',
      target: view.framebuffer,
      effects: undefined,
      shaderModuleProps: {
        // A depth attachment cannot be bound for sampling in the same pass.
        shadow: emptyShadow,
        deckShadowMap: {caster: 1, matrix: view.viewProjectionMatrix, ...getCommonSpace(viewport)}
      }
    });
  }

  shouldDrawLayer(layer: Layer): boolean {
    return (
      (layer.props as {shadowEnabled?: boolean}).shadowEnabled !== false &&
      layer.props.operation.includes('draw')
    );
  }

  protected getLayerParameters(layer: Layer): RenderPipelineParameters {
    return {...layer.props.parameters, ...this.rasterParameters, blend: false, cullMode: 'none'};
  }
}

function getCommonSpace(viewport?: Viewport) {
  return {
    commonOrigin: viewport?.center ?? [0, 0, 0],
    unitsPerMeter: viewport?.getDistanceScales().unitsPerMeter[2] ?? 1
  };
}

function getCamera(viewport: Viewport): ShadowCamera {
  const {viewMatrix, projectionMatrix} = viewport;
  const {unitsPerMeter, commonOrigin} = getCommonSpace(viewport);
  const viewUnitsPerMeter =
    unitsPerMeter * Math.hypot(viewMatrix[8], viewMatrix[9], viewMatrix[10]);
  const depth = projectionMatrix[10];
  const translation = projectionMatrix[14];
  const perspective = projectionMatrix[11] !== 0;
  return {
    viewMatrix: new Matrix4()
      .scale(1 / viewUnitsPerMeter)
      .multiplyRight(viewMatrix)
      .translate(commonOrigin)
      .scale(unitsPerMeter),
    projectionMatrix: new Matrix4(projectionMatrix).scale(viewUnitsPerMeter),
    near: (perspective ? translation / (depth - 1) : (translation + 1) / depth) / viewUnitsPerMeter,
    far: (perspective ? translation / (depth + 1) : (translation - 1) / depth) / viewUnitsPerMeter
  };
}
