// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {shadow} from '@luma.gl/experimental';
import {
  lambertMaterial,
  clouds,
  atmosphere,
  type CloudProps,
  type AtmosphereProps,
  type ShaderModule
} from '@luma.gl/shadertools';
import {getMeterOffsetPosition} from '@deck.gl-community/gpu-layers';
import {makeCityMesh, type CityFeature} from '../river-district-data';
import {RiverfrontShadowEffect} from './shadow-effect';
import {getRiverfrontSkyLighting} from '../riverfront-sky-lighting';

type ShadowDistrictLayerProps = LayerProps & {
  features: readonly CityFeature[];
  shadowEffect: RiverfrontShadowEffect;
  clouds: () => CloudProps;
  atmosphere: () => AtmosphereProps;
};

const receiverUniforms = {
  name: 'riverfrontReceiver',
  uniformTypes: {viewMatrix: 'mat4x4<f32>', cameraPosition: 'vec3<f32>'},
  vs: `layout(std140) uniform riverfrontReceiverUniforms { mat4 viewMatrix;
vec3 cameraPosition; } riverfrontReceiver;`,
  fs: `layout(std140) uniform riverfrontReceiverUniforms {
    mat4 viewMatrix;
    vec3 cameraPosition;
  } riverfrontReceiver;`,
  source: `struct RiverfrontReceiverUniforms { viewMatrix: mat4x4f,
cameraPosition: vec3f };
@group(3) @binding(auto) var<uniform> riverfrontReceiver: RiverfrontReceiverUniforms;`
} as const satisfies ShaderModule;

/** Deck projection/picking adapter; luma owns material lighting and shadow filtering. */
export class ShadowDistrictLayer extends Layer<ShadowDistrictLayerProps> {
  static override layerName = 'ShadowDistrictLayer';
  declare state: {model?: Model; vertices?: Buffer};

  override getAttributeManager() {
    return null;
  }
  override initializeState(): void {}

  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (this.state.model && props.features === oldProps.features) return;
    this.destroyMesh();
    const mesh = makeCityMesh(props.features);
    const vertices = this.context.device.createBuffer({data: mesh});
    this.setState({vertices});
    try {
      const model = new Model(this.context.device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [
            project32,
            picking,
            lambertMaterial,
            shadow,
            clouds,
            atmosphere,
            receiverUniforms
          ]
        }),
        id: `${this.id}-mesh`,
        topology: 'triangle-list',
        vertexCount: mesh.length / 10,
        bufferLayout: [
          {
            name: 'vertices',
            byteStride: 40,
            attributes: [
              {attribute: 'position', format: 'float32x3', byteOffset: 0},
              {attribute: 'normal', format: 'float32x3', byteOffset: 12},
              {attribute: 'color', format: 'float32x3', byteOffset: 24},
              {attribute: 'featureIndex', format: 'float32', byteOffset: 36}
            ]
          }
        ],
        attributes: {vertices},
        parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
      });
      this.setState({model});
    } catch (error) {
      this.destroyMesh();
      throw error;
    }
  }

  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const effect = this.props.shadowEffect;
    if (!effect.shadowProps) return;
    const skyLighting = getRiverfrontSkyLighting(effect.settings.hour, this.props.clouds().cover);
    this.state.model?.shaderInputs.setProps({
      shadow: effect.shadowProps,
      clouds: {...clouds.defaultUniforms, ...this.props.clouds()},
      atmosphere: {...atmosphere.defaultUniforms, ...this.props.atmosphere()},
      riverfrontReceiver: {
        viewMatrix: effect.viewMatrix,
        cameraPosition: getMeterOffsetPosition(
          this.context.viewport,
          this.props.coordinateOrigin,
          this.context.viewport.cameraPosition
        )
      },
      lambertMaterial: {ambient: 0.3, diffuse: 0.85},
      lighting: skyLighting.lights
    });
    this.state.model?.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    info.object = this.props.features[info.index];
    return info;
  }
  override finalizeState(context: LayerContext): void {
    this.destroyMesh();
    super.finalizeState(context);
  }
  private destroyMesh(): void {
    this.state.model?.destroy();
    this.state.vertices?.destroy();
    this.setState({model: undefined, vertices: undefined});
  }
}

const SOURCE = /* wgsl */ `
struct CityVertex {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
  @location(1) @interpolate(flat) pickingColor: vec3f,
  @location(2) worldPosition: vec3f,
  @location(3) normal: vec3f,
  @location(4) viewDepth: f32,
};
@vertex fn vertexMain(
  @location(0) position: vec3f, @location(1) normal: vec3f,
  @location(2) color: vec3f, @location(3) featureIndex: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3f(0.0), vec3f(0.0));
  output.worldPosition = position;
  output.normal = normal;
  output.viewDepth = -(riverfrontReceiver.viewMatrix * vec4f(position, 1.0)).z;
  output.color = color;
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  return output;
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4f(input.pickingColor, 1.0);
  }
  let normal = normalize(input.normal);
  let ambient = lambertMaterial.ambient * input.color * lighting.ambientColor;
  let lit = lighting_getLightColor2(input.color, vec3f(0.0), input.worldPosition, normal);
  let visibility = shadow_getDirectionalFactor(input.worldPosition, normal, input.viewDepth) * clouds_getTransmittance(input.worldPosition);
  var color = ambient + (lit - ambient) * visibility;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return atmosphere_getColor(vec4f(color, layer.opacity), input.worldPosition, riverfrontReceiver.cameraPosition);
}
`;

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
out vec3 surfaceColor;
out vec3 worldPosition;
out vec3 surfaceNormal;
out float viewDepth;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  vec4 commonPosition;
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0), commonPosition);
  geometry.position = commonPosition;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vec4 filterColor = vec4(color, 1.0);
  DECKGL_FILTER_COLOR(filterColor, geometry);
  surfaceColor = color;
  worldPosition = position;
  surfaceNormal = normal;
  viewDepth = -(riverfrontReceiver.viewMatrix * vec4(position, 1.0)).z;
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec3 surfaceColor;
in vec3 worldPosition;
in vec3 surfaceNormal;
in float viewDepth;
out vec4 fragColor;
void main() {
  vec3 normal = normalize(surfaceNormal);
  vec3 ambient = material.ambient * surfaceColor * lighting.ambientColor;
  vec3 lit = lighting_getLightColor(surfaceColor, vec3(0.0), worldPosition, normal);
  float visibility = shadow_getDirectionalFactor(worldPosition, normal, viewDepth) * clouds_getTransmittance(worldPosition);
  fragColor = atmosphere_getColor(vec4(ambient + (lit - ambient) * visibility, layer.opacity), worldPosition, riverfrontReceiver.cameraPosition);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}`;
