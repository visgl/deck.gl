// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, picking, _GlobeViewport, type LayerContext, type LayerProps} from '@deck.gl/core';
import {getGlobeCloudViewUniforms} from '@deck.gl-community/gpu-layers';
import type {RenderPass, Texture} from '@luma.gl/core';
import {Model, SphereGeometry} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import type {NumberArray3} from '@math.gl/core';

const earthScene = {
  name: 'earthScene',
  uniformTypes: {
    viewProjectionMatrix: 'mat4x4<f32>',
    sunDirection: 'vec3<f32>',
    moonDirection: 'vec3<f32>',
    moonColor: 'vec3<f32>',
    moonIntensity: 'f32',
    camera: 'vec3<f32>'
  },
  source: `struct earthSceneUniforms {
    viewProjectionMatrix: mat4x4f,
    sunDirection: vec3f,
    moonDirection: vec3f,
    moonColor: vec3f,
    moonIntensity: f32,
    camera: vec3f,
  };
    @group(3) @binding(auto) var<uniform> earthScene: earthSceneUniforms;
    @group(3) @binding(auto) var earthTexture: texture_2d<f32>;
    @group(3) @binding(auto) var earthSampler: sampler;`,
  vs: `layout(std140) uniform earthSceneUniforms {
    mat4 viewProjectionMatrix;
    vec3 sunDirection;
    vec3 moonDirection;
    vec3 moonColor;
    float moonIntensity;
    vec3 camera;
  } earthScene;`,
  fs: `layout(std140) uniform earthSceneUniforms {
    mat4 viewProjectionMatrix;
    vec3 sunDirection;
    vec3 moonDirection;
    vec3 moonColor;
    float moonIntensity;
    vec3 camera;
  } earthScene;
    uniform sampler2D earthTexture;`
} as const satisfies ShaderModule;

type EarthLayerProps = LayerProps & {
  texture: Texture;
  sunDirection: NumberArray3;
  moonDirection: NumberArray3;
  moonColor: NumberArray3;
  moonIntensity: number;
};

/** Example-owned surface; the cloud layer also works with other GlobeView terrain layers. */
export class EarthLayer extends Layer<EarthLayerProps> {
  static override layerName = 'EarthLayer';
  static override defaultProps = {
    parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
  };
  declare state: {model: Model};
  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext): void {
    this.setState({
      model: new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [picking, earthScene]
        }),
        id: `${this.id}-surface`,
        geometry: new SphereGeometry({nlat: 96, nlong: 192}),
        bufferLayout: [{name: 'positions', format: 'float32x3'}],
        parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
      })
    });
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const viewport = this.context.viewport;
    if (!(viewport instanceof _GlobeViewport)) return;
    const view = getGlobeCloudViewUniforms(viewport);
    this.state.model.shaderInputs.setProps({
      earthScene: {
        viewProjectionMatrix: view.viewProjectionMatrix,
        sunDirection: this.props.sunDirection,
        moonDirection: this.props.moonDirection,
        moonColor: this.props.moonColor,
        moonIntensity: this.props.moonIntensity,
        camera: view.camera
      }
    });
    this.state.model.setBindings({
      earthTexture: this.props.texture,
      ...(this.context.device.type === 'webgpu' ? {earthSampler: this.props.texture.sampler} : {})
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    super.finalizeState(context);
  }
}

const SOURCE = /* wgsl */ `
struct EarthVertex {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
};
@vertex fn vertexMain(@location(0) positions: vec3f) -> EarthVertex {
  let position = vec3f(-positions.z, positions.x, positions.y);
  var output: EarthVertex;
  output.normal = position;
  output.position = earthScene.viewProjectionMatrix * vec4f(position, 1.0);
  output.position.z = (output.position.z + output.position.w) * 0.5;
  return output;
}
@fragment fn fragmentMain(input: EarthVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  let normal = normalize(input.normal);
  // The sphere transform reverses winding; reject its far side consistently on both backends.
  if (dot(normal, earthScene.camera - input.normal) <= 0.0) { discard; }
  let coordinates = vec2f(atan2(normal.x, -normal.y) / 6.28318530718 + 0.5, 0.5 - asin(normal.z) / 3.14159265359);
  let surface = textureSample(earthTexture, earthSampler, coordinates).rgb;
  let sunlight = max(dot(normal, normalize(earthScene.sunDirection)), 0.0);
  let moonlight = max(dot(normal, normalize(earthScene.moonDirection)), 0.0) * earthScene.moonIntensity;
  let night = 1.0 - smoothstep(0.0, 0.15, sunlight);
  return vec4f(surface * (vec3f(0.035 + sunlight * 0.965) + earthScene.moonColor * moonlight * night), 1.0);
}`;
const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 positions; out vec3 normal;
void main() {
  normal = vec3(-positions.z, positions.x, positions.y);
  gl_Position = earthScene.viewProjectionMatrix * vec4(normal, 1.0);
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec3 normal; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  vec3 direction = normalize(normal);
  if (dot(direction, earthScene.camera - normal) <= 0.0) discard;
  vec2 coordinates = vec2(atan(direction.x, -direction.y) / 6.28318530718 + 0.5, 0.5 - asin(direction.z) / 3.14159265359);
  float sunlight = max(dot(direction, normalize(earthScene.sunDirection)), 0.0);
  float moonlight = max(dot(direction, normalize(earthScene.moonDirection)), 0.0) * earthScene.moonIntensity;
  float night = 1.0 - smoothstep(0.0, 0.15, sunlight);
  fragColor = vec4(texture(earthTexture, coordinates).rgb * (vec3(0.035 + sunlight * 0.965) + earthScene.moonColor * moonlight * night), 1.0);
}`;
