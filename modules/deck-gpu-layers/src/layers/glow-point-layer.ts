// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type LayerContext,
  type LayerProps,
  type UpdateParameters
} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {
  pointGlow,
  firefly,
  type FireflyProps,
  type PointGlowProps,
  type ShaderModule
} from '@luma.gl/shadertools';

import {motionBuffer} from './motion-buffer';

export type GlowPointLayerProps = LayerProps & {
  /** Borrowed float32 rows: position.xyz, linear tint.rgb, opacity, featureIndex. */
  points: Buffer;
  pointCount: number;
  /** Outer halo radius in CSS pixels, independent of perspective depth. */
  radiusPixels?: number;
  /** Picking disk radius in CSS pixels, clamped to the visible outer radius. */
  pickingRadiusPixels?: number;
  style?: PointGlowProps;
  /** Optional GPU wandering/pulsing, disabled for ordinary point lights. */
  animation?: FireflyProps;
  time?: number | (() => number);
};

const glowPoint = {
  name: 'glowPoint',
  bindingLayout: [{name: 'glowPoint', group: 3}],
  source: `struct GlowPointUniforms {
  radiusPixels: f32,
  pickingRadiusPixels: f32,
  opacity: f32
}; @group(3) @binding(auto) var<uniform> glowPoint: GlowPointUniforms;`,
  vs: `layout(std140) uniform glowPointUniforms {
  float radiusPixels;
  float pickingRadiusPixels;
  float opacity;
} glowPoint;`,
  fs: `layout(std140) uniform glowPointUniforms {
  float radiusPixels;
  float pickingRadiusPixels;
  float opacity;
} glowPoint;`,
  uniformTypes: {radiusPixels: 'f32', pickingRadiusPixels: 'f32', opacity: 'f32'},
  defaultUniforms: {radiusPixels: 18, pickingRadiusPixels: 5, opacity: 1}
} as const satisfies ShaderModule<
  {},
  {radiusPixels: number; pickingRadiusPixels: number; opacity: number}
>;

const GLOW_PARAMETERS = {
  depthCompare: 'less-equal',
  depthWriteEnabled: false,
  cullMode: 'none',
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'one',
  blendColorDstFactor: 'one',
  blendAlphaSrcFactor: 'zero',
  blendAlphaDstFactor: 'one'
} as const;

/** Additive, depth-tested point sprites. Input buffers remain caller-owned. */
export class GlowPointLayer extends Layer<GlowPointLayerProps> {
  static override layerName = 'GlowPointLayer';
  static override defaultProps = {
    radiusPixels: {type: 'number', value: 18, min: 0},
    pickingRadiusPixels: {type: 'number', value: 5, min: 0},
    style: {},
    animation: {},
    time: 0,
    parameters: GLOW_PARAMETERS
  };
  declare state: {model: Model; corners: Buffer};

  override getAttributeManager() {
    return null;
  }
  override getNumInstances(): number {
    return this.props.pointCount;
  }

  override initializeState({device}: LayerContext): void {
    const corners = device.createBuffer({
      data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    });
    try {
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [project32, picking, pointGlow, firefly, motionBuffer, glowPoint]
        }),
        id: `${this.id}-glow`,
        topology: 'triangle-list',
        isInstanced: true,
        vertexCount: 6,
        instanceCount: this.props.pointCount,
        bufferLayout: [
          {name: 'corner', format: 'float32x2'},
          {
            name: 'points',
            stepMode: 'instance',
            byteStride: 32,
            attributes: [
              {attribute: 'position', format: 'float32x3', byteOffset: 0},
              {attribute: 'tint', format: 'float32x3', byteOffset: 12},
              {attribute: 'opacity', format: 'float32', byteOffset: 24},
              {attribute: 'featureIndex', format: 'float32', byteOffset: 28}
            ]
          }
        ],
        attributes: {corner: corners, points: this.props.points},
        parameters: GLOW_PARAMETERS
      });
      this.setState({model, corners});
    } catch (error) {
      corners.destroy();
      throw error;
    }
  }
  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (props.points !== oldProps.points) this.state.model.setAttributes({points: props.points});
    this.state.model.setInstanceCount(props.pointCount);
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    this.state.model.shaderInputs.setProps({
      pointGlow: this.props.style || {},
      firefly: {
        ...firefly.defaultUniforms,
        ...this.props.animation,
        time: typeof this.props.time === 'function' ? this.props.time() : (this.props.time ?? 0)
      },
      glowPoint: {
        radiusPixels: Math.max(0, this.props.radiusPixels!),
        pickingRadiusPixels: Math.max(0, this.props.pickingRadiusPixels!),
        opacity: this.props.opacity
      }
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    this.state.corners?.destroy();
    super.finalizeState(context);
  }
}

const SOURCE = /* wgsl */ `
struct GlowVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) coordinates: vec2<f32>,
  @location(1) tint: vec3<f32>,
  @location(2) opacity: f32,
  @location(3) @interpolate(flat) pickingColor: vec3<f32>,
  @location(4) velocity: vec2f,
};
@vertex fn vertexMain(@location(0) corner: vec2<f32>,
  @location(1) position: vec3<f32>, @location(2) tint: vec3<f32>,
  @location(3) opacity: f32, @location(4) featureIndex: f32
) -> GlowVertex {
  let animatedPosition = firefly_getPosition(position, featureIndex, firefly.time);
  let center = project_position_to_clipspace(animatedPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  let previousPosition = firefly_getPosition(position, featureIndex, motionBuffer.previousTime);
  let previousClip = project_position_to_clipspace(previousPosition, vec3f(0.0), vec3f(0.0));
  let offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  var output: GlowVertex;
  output.position = vec4<f32>(center.xy + offset * center.w, center.z, center.w);
  output.coordinates = corner;
  output.velocity = motionBuffer_getVelocity(center, previousClip);
  output.tint = tint;
  output.opacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  output.pickingColor = vec3<f32>(0.0);
  if (featureIndex >= 0.0) { output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex)); }
  return output;
}
@fragment fn fragmentMain(input: GlowVertex) -> @location(0) vec4<f32> {
  let radiance = pointGlow_getColor(input.coordinates, input.tint) * input.opacity;
  if (input.opacity <= 0.0 || glowPoint.radiusPixels <= 0.0) { discard; }
  if (motionBuffer.enabled != 0) {
    if (length(input.coordinates) > 0.35) { discard; }
    return vec4f(input.velocity, 0.0, 1.0);
  }
  if (picking.isActive > 0.5) {
    if (glowPoint.pickingRadiusPixels <= 0.0) { discard; }
    let pickingRadius = min(1.0, glowPoint.pickingRadiusPixels / max(glowPoint.radiusPixels, 0.0001));
    if (length(input.coordinates) > pickingRadius || picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = radiance;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb * max(max(color.r, color.g), color.b), picking.highlightColor.a);
  }
  return vec4<f32>(color, 0.0);
}
`;
const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 corner;
in vec3 position;
in vec3 tint;
in float opacity;
in float featureIndex;
out vec2 coordinates;
out vec3 vertexTint;
out float vertexOpacity;
out vec2 vertexVelocity;
void main() {
  coordinates = corner;
  vertexTint = tint;
  vertexOpacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  vec3 animatedPosition = firefly_getPosition(position, featureIndex, firefly.time);
  geometry.worldPosition = animatedPosition;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(animatedPosition, vec3(0.0), vec3(0.0));
  vec4 previousClip = project_position_to_clipspace(firefly_getPosition(position, featureIndex, motionBuffer.previousTime), vec3(0.0), vec3(0.0));
  vertexVelocity = motionBuffer_getVelocity(gl_Position, previousClip);
  gl_Position.xy += coordinates * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize * gl_Position.w;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vec4 color = vec4(1.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
in vec2 coordinates;
in vec3 vertexTint;
in float vertexOpacity;
in vec2 vertexVelocity;
out vec4 fragColor;
void main() {
  vec3 radiance = pointGlow_getColor(coordinates, vertexTint) * vertexOpacity;
  if (vertexOpacity <= 0.0 || glowPoint.radiusPixels <= 0.0) discard;
  if (motionBuffer.enabled != 0) {
    if (length(coordinates) > 0.35) discard;
    fragColor = vec4(vertexVelocity, 0.0, 1.0);
    return;
  }
  if (picking.isActive > 0.5) {
    if (glowPoint.pickingRadiusPixels <= 0.0) discard;
    float pickingRadius = min(1.0, glowPoint.pickingRadiusPixels / max(glowPoint.radiusPixels, 0.0001));
    if (length(coordinates) > pickingRadius) discard;
  }
  // Apply Deck's highlight tint before restoring radiance. A zero-alpha color would
  // otherwise turn the entire sprite quad into the opaque highlight color.
  float energy = max(max(radiance.r, radiance.g), radiance.b);
  fragColor = vec4(radiance / max(energy, 0.0001), 1.0);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  if (picking.isActive < 0.5) fragColor = vec4(fragColor.rgb * energy, 0.0);
}
`;
