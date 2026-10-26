// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, picking, _GlobeViewport, type LayerContext, type LayerProps} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import {getStarfieldRotation, type SkyObserver} from '@math.gl/sun';
import {getStarPositions, getStarLayerData, type StarLayerDatum} from '@math.gl/sun/stars';
import {getSkyObserver, getSkyProjectionMatrix, makeSkyRotationMatrix} from './sky-coordinates';

export type StarfieldLayerProps = LayerProps & {
  /** Optional math.gl star data in fixed J2000 equatorial coordinates; defaults to BSC5. */
  data?: readonly StarLayerDatum[];
  timestamp?: number | Date;
  observer?: SkyObserver;
  brightness?: number;
  /** Subtle spectral tint; zero renders neutral stars, one preserves the catalog RGB. */
  colorStrength?: number;
};
let defaultStars: StarLayerDatum[] | undefined;
function getDefaultStars(): StarLayerDatum[] {
  if (!defaultStars)
    defaultStars = getStarLayerData(getStarPositions(2000), {
      coordinates: 'equatorial',
      distance: 1,
      radiusScale: 2,
      maximumRadiusPixels: 2
    });
  return defaultStars;
}
const starfield = {
  name: 'starfield',
  uniformTypes: {
    projection: 'mat4x4<f32>',
    localUp: 'vec3<f32>',
    offset: 'vec2<f32>',
    clipHorizon: 'f32',
    brightness: 'f32',
    colorStrength: 'f32'
  },
  source: `struct starfieldUniforms {
    projection: mat4x4f,
    localUp: vec3f,
    offset: vec2f,
    clipHorizon: f32,
    brightness: f32,
    colorStrength: f32,
  }; @group(3) @binding(auto) var<uniform> starfield: starfieldUniforms;`,
  vs: `layout(std140) uniform starfieldUniforms {
    mat4 projection;
    vec3 localUp;
    vec2 offset;
    float clipHorizon;
    float brightness;
    float colorStrength;
  } starfield;`
} as const satisfies ShaderModule;

/** Instanced catalog stars at infinite distance. Sidereal rotation follows map/globe cameras. */
export class StarfieldLayer extends Layer<StarfieldLayerProps> {
  static override layerName = 'StarfieldLayer';
  static override defaultProps = {
    data: null,
    timestamp: undefined,
    observer: undefined,
    brightness: {type: 'number', value: 1, min: 0},
    colorStrength: {type: 'number', value: 0.2, min: 0, max: 1},
    pickable: false,
    parameters: {
      depthCompare: 'less-equal',
      depthWriteEnabled: false,
      cullMode: 'none',
      blend: true,
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one-minus-src-alpha',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one-minus-src-alpha'
    }
  };
  declare state: {model: Model; corners: Buffer; stars: Buffer; data: readonly StarLayerDatum[]};
  override getNumInstances(): number {
    return (this.props.data ?? getDefaultStars()).length;
  }
  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext): void {
    const corners = device.createBuffer({
      data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    });
    const data = this.props.data ?? getDefaultStars();
    const stars = this.makeStarBuffer(device, data);
    try {
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [picking, starfield]
        }),
        id: `${this.id}-stars`,
        topology: 'triangle-list',
        isInstanced: true,
        vertexCount: 6,
        instanceCount: data.length,
        bufferLayout: [
          {name: 'corner', format: 'float32x2'},
          {
            name: 'stars',
            stepMode: 'instance',
            attributes: [
              {attribute: 'direction', format: 'float32x3'},
              {attribute: 'radius', format: 'float32'},
              {attribute: 'color', format: 'float32x4'}
            ]
          }
        ],
        attributes: {corner: corners, stars}
      });
      this.setState({model, corners, stars, data});
    } catch (error) {
      corners.destroy();
      stars.destroy();
      throw error;
    }
  }
  private makeStarBuffer(device: LayerContext['device'], data: readonly StarLayerDatum[]): Buffer {
    const values = new Float32Array(Math.max(1, data.length) * 8);
    data.forEach((star, index) => {
      values.set(
        [...star.position, star.radiusPixels, ...star.color.map(channel => channel / 255)],
        index * 8
      );
    });
    return device.createBuffer({data: values});
  }
  override updateState(): void {
    const data = this.props.data ?? getDefaultStars();
    if (data === this.state.data) return;
    const stars = this.makeStarBuffer(this.context.device, data);
    this.state.model.setAttributes({stars});
    this.state.model.setInstanceCount(data.length);
    this.state.stars.destroy();
    this.setState({stars, data});
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const viewport = this.context.viewport;
    if (viewport.projectionMatrix[15] !== 0) return;
    const observer = getSkyObserver(viewport, this.props.observer, this.props.coordinateOrigin);
    const rotation = getStarfieldRotation(
      this.props.timestamp ?? Date.now(),
      observer.latitude,
      observer.longitude,
      {epoch: 'J2000'}
    );
    this.state.model.shaderInputs.setProps({
      starfield: {
        projection: getSkyProjectionMatrix(viewport, observer).multiplyRight(
          makeSkyRotationMatrix(rotation)
        ),
        localUp: [rotation[2], rotation[5], rotation[8]],
        offset: [2 / viewport.width, 2 / viewport.height],
        clipHorizon: viewport instanceof _GlobeViewport ? 0 : 1,
        brightness: this.props.brightness! * this.props.opacity,
        colorStrength: this.props.colorStrength!
      }
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    this.state.corners?.destroy();
    this.state.stars?.destroy();
    super.finalizeState(context);
  }
}
const SOURCE = /* wgsl */ `
struct StarVertex { @builtin(position) position: vec4f,
  @location(0) coordinate: vec2f, @location(1) color: vec4f };
@vertex fn vertexMain(@location(0) corner: vec2f, @location(1) direction: vec3f,
  @location(2) radius: f32, @location(3) color: vec4f) -> StarVertex {
  let clip = starfield.projection * vec4f(direction, 0.0);
  var output: StarVertex;
  output.position = vec4f(clip.xy / max(clip.w, 0.00001) + corner * radius * starfield.offset, 1.0, 1.0);
  output.coordinate = corner;
  output.color = vec4f(mix(vec3f(1.0), pow(color.rgb, vec3f(2.2)), starfield.colorStrength) * starfield.brightness, color.a);
  if (clip.w <= 0.0 || (starfield.clipHorizon > 0.5 && dot(direction, starfield.localUp) <= 0.0)) {
    output.position = vec4f(2.0, 2.0, 1.0, 1.0);
  }
  return output;
}
@fragment fn fragmentMain(input: StarVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) {discard;}
  let radius = length(input.coordinate);
  let alpha = (1.0 - smoothstep(0.25, 1.0, radius)) * input.color.a;
  return vec4f(input.color.rgb * alpha, alpha);
}`;
const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 corner; in vec3 direction; in float radius; in vec4 color;
out vec2 coordinate; out vec4 starColor;
void main() {
  vec4 clip = starfield.projection * vec4(direction, 0.0);
  gl_Position = vec4(clip.xy / max(clip.w, 0.00001) + corner * radius * starfield.offset, 1.0, 1.0);
  if (clip.w <= 0.0 || (starfield.clipHorizon > 0.5 && dot(direction, starfield.localUp) <= 0.0))
    gl_Position = vec4(2.0, 2.0, 1.0, 1.0);
  coordinate = corner; starColor = vec4(mix(vec3(1.0), pow(color.rgb, vec3(2.2)), starfield.colorStrength) * starfield.brightness, color.a);
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 coordinate; in vec4 starColor; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  float alpha = (1.0 - smoothstep(0.25, 1.0, length(coordinate))) * starColor.a;
  fragColor = vec4(starColor.rgb * alpha, alpha);
}`;
