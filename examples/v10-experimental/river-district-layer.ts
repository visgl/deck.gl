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
import {
  heightFog,
  lambertMaterial,
  surfaceWeather,
  type SurfaceWeatherProps,
  type LightingProps,
  type LambertMaterialProps,
  type HeightFogProps,
  type ShaderModule
} from '@luma.gl/shadertools';
import {getMeterOffsetPosition, surfaceBuffer} from '@deck.gl-community/gpu-layers';
import {makeCityMesh, type CityFeature} from './river-district-data';

type RiverDistrictLayerProps = LayerProps & {
  features: readonly CityFeature[];
  fog?: HeightFogProps | (() => HeightFogProps);
  roughness?: number;
  lighting?: LightingProps | (() => LightingProps);
  material?: LambertMaterialProps;
  surfaceWeather?: SurfaceWeatherProps | (() => SurfaceWeatherProps);
};

/** Shared fixture adapter using luma materials and Deck projection, picking, and capture. */
export class RiverDistrictLayer extends Layer<RiverDistrictLayerProps> {
  static override layerName = 'RiverDistrictLayer';
  static override defaultProps = {
    fog: {},
    roughness: 1,
    surfaceWeather: {},
    parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
  };
  declare state: {model?: Model; vertices?: Buffer; surfaceExposure?: Buffer};

  override getAttributeManager() {
    return null;
  }
  override initializeState(): void {}

  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (this.state.model && props.features === oldProps.features) return;
    this.destroyMesh();
    const mesh = makeCityMesh(props.features);
    const vertices = this.context.device.createBuffer({data: mesh});
    // Water opts out of surface accumulation; callers can supply finer shelter masks in their own adapters.
    const weights = new Float32Array(mesh.length / 10);
    for (let vertexIndex = 0; vertexIndex < weights.length; vertexIndex++) {
      weights[vertexIndex] = props.features[mesh[vertexIndex * 10 + 9]].kind === 'water' ? 0 : 1;
    }
    const surfaceExposure = this.context.device.createBuffer({data: weights});
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
            heightFog,
            surfaceWeather,
            surfaceBuffer,
            districtMesh
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
          },
          {name: 'surfaceExposure', format: 'float32'}
        ],
        attributes: {vertices, surfaceExposure},
        parameters: {depthCompare: 'less-equal', depthWriteEnabled: true, cullMode: 'none'}
      });
      this.setState({model, vertices, surfaceExposure});
    } catch (error) {
      vertices.destroy();
      surfaceExposure.destroy();
      throw error;
    }
  }

  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    this.state.model?.shaderInputs.setProps({
      heightFog: {
        ...heightFog.defaultUniforms,
        ...(typeof this.props.fog === 'function' ? this.props.fog() : this.props.fog)
      },
      surfaceWeather: {
        ...surfaceWeather.defaultUniforms,
        ...(typeof this.props.surfaceWeather === 'function'
          ? this.props.surfaceWeather()
          : this.props.surfaceWeather)
      },
      districtMesh: {
        roughness: this.props.roughness,
        cameraPosition: getMeterOffsetPosition(
          this.context.viewport,
          this.props.coordinateOrigin!,
          this.context.viewport.cameraPosition
        )
      },
      lambertMaterial: {ambient: 0.45, diffuse: 0.55, ...this.props.material},
      lighting: this.props.lighting
        ? typeof this.props.lighting === 'function'
          ? this.props.lighting()
          : this.props.lighting
        : {
            enabled: true,
            lights: [
              {type: 'ambient', color: [255, 255, 255], intensity: 1},
              {
                type: 'directional',
                color: [255, 255, 255],
                intensity: 1,
                direction: [0.5, 0.3, -0.8]
              }
            ]
          }
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
    this.state.surfaceExposure?.destroy();
    this.setState({model: undefined, vertices: undefined, surfaceExposure: undefined});
  }
}

const districtMesh = {
  name: 'districtMesh',
  bindingLayout: [{name: 'districtMesh', group: 3}],
  source: `struct DistrictMeshUniforms {
  roughness: f32,
  cameraPosition: vec3f,
};
@group(3) @binding(auto) var<uniform> districtMesh: DistrictMeshUniforms;`,
  fs: `layout(std140) uniform districtMeshUniforms {
  float roughness;
  vec3 cameraPosition;
} districtMesh;`,
  uniformTypes: {roughness: 'f32', cameraPosition: 'vec3<f32>'},
  defaultUniforms: {roughness: 1, cameraPosition: [0, 0, 0]}
} as const satisfies ShaderModule;

const SOURCE = /* wgsl */ `
struct CityVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) worldPosition: vec3<f32>,
  @location(3) normal: vec3<f32>,
  @location(4) commonNormal: vec3<f32>,
  @location(5) exposure: f32,
};
@vertex fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>, @location(3) featureIndex: f32, @location(4) surfaceExposure: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.worldPosition = position;
  output.normal = normal;
  output.commonNormal = project_normal(normal);
  output.color = color;
  output.exposure = surfaceExposure;
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  return output;
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4<f32> {
  if (surfaceBuffer.enabled != 0) {
    return surfaceBuffer_encode(input.commonNormal, surfaceWeather_getRoughness(districtMesh.roughness, input.worldPosition, input.normal, input.exposure));
  }
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  let cameraPosition = districtMesh.cameraPosition;
  let albedo = surfaceWeather_getAlbedo(input.color, input.worldPosition, input.normal, input.exposure);
  var color = lighting_getLightColor2(albedo, cameraPosition, input.worldPosition, normalize(input.normal));
  color += surfaceWeather_getReflection(input.worldPosition, input.normal, cameraPosition,
    vec3f(-0.5, -0.3, 0.8), vec3f(1.0), input.exposure);
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return heightFog_getColor(vec4<f32>(color, layer.opacity), input.worldPosition, cameraPosition);
}
`;

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
in float surfaceExposure;
out float exposure;
out vec4 vertexColor;
out vec3 worldPosition;
out vec3 worldNormal;
out vec3 commonNormal;
void main() {
  worldPosition = position;
  exposure = surfaceExposure;
  worldNormal = normal;
  commonNormal = project_normal(normal);
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vertexColor = vec4(color, layer.opacity);
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec4 vertexColor;
in vec3 worldPosition;
in vec3 worldNormal;
in vec3 commonNormal;
in float exposure;
out vec4 fragColor;
void main() {
  if (surfaceBuffer.enabled != 0) {
    fragColor = surfaceBuffer_encode(commonNormal, surfaceWeather_getRoughness(districtMesh.roughness, worldPosition, worldNormal, exposure));
    return;
  }
  vec3 albedo = surfaceWeather_getAlbedo(vertexColor.rgb, worldPosition, worldNormal, exposure);
  vec3 color = lighting_getLightColor(albedo, districtMesh.cameraPosition, worldPosition, normalize(worldNormal));
  color += surfaceWeather_getReflection(worldPosition, worldNormal, districtMesh.cameraPosition,
    vec3(-0.5, -0.3, 0.8), vec3(1.0), exposure);
  fragColor = heightFog_getColor(vec4(color, vertexColor.a), worldPosition, districtMesh.cameraPosition);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
