// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  COORDINATE_SYSTEM,
  Layer,
  picking,
  project32,
  type Color,
  type LayerContext,
  type LayerProps,
  type UpdateParameters
} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {sketchStroke, type SketchStrokeProps, type ShaderModule} from '@luma.gl/shadertools';

export type SketchEdgeLayerProps = LayerProps & {
  /** Borrowed interleaved float32 rows: start.xyz, end.xyz, featureIndex, stable seed. */
  segments: Buffer;
  segmentCount: number;
  color?: Color;
  style?: SketchStrokeProps;
};

const sketchEdge = {
  name: 'sketchEdge',
  bindingLayout: [{name: 'sketchEdge', group: 3}],
  source: `struct SketchEdgeUniforms { color: vec4<f32> }; @group(3) @binding(auto) var<uniform> sketchEdge: SketchEdgeUniforms;`,
  fs: `layout(std140) uniform sketchEdgeUniforms { vec4 color; } sketchEdge;`,
  uniformTypes: {color: 'vec4<f32>'},
  defaultUniforms: {color: [0.1, 0.1, 0.1, 1]}
} as const satisfies ShaderModule<{}, {color: readonly [number, number, number, number]}>;

/** Pixel-sized independent edge segments. Fill layers supply depth occlusion. */
export class SketchEdgeLayer extends Layer<SketchEdgeLayerProps> {
  static override layerName = 'SketchEdgeLayer';
  static override defaultProps = {
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    getPolygonOffset: () => [0, 0],
    color: [35, 31, 29, 255],
    style: {}
  };
  declare state: {model: Model; corners: Buffer};

  override getAttributeManager() {
    return null;
  }
  override getNumInstances(): number {
    return this.props.segmentCount;
  }

  override initializeState({device}: LayerContext): void {
    const corners = device.createBuffer({
      data: new Float32Array([0, -1, 1, -1, 0, 1, 0, 1, 1, -1, 1, 1])
    });
    try {
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [project32, picking, sketchStroke, sketchEdge]
        }),
        id: `${this.id}-strokes`,
        topology: 'triangle-list',
        vertexCount: 6,
        instanceCount: this.props.segmentCount,
        bufferLayout: [
          {name: 'corner', format: 'float32x2'},
          {
            name: 'segments',
            stepMode: 'instance',
            byteStride: 32,
            attributes: [
              {attribute: 'startPosition', format: 'float32x3', byteOffset: 0},
              {attribute: 'endPosition', format: 'float32x3', byteOffset: 12},
              {attribute: 'featureIndex', format: 'float32', byteOffset: 24},
              {attribute: 'seed', format: 'float32', byteOffset: 28}
            ]
          }
        ],
        attributes: {corner: corners, segments: this.props.segments},
        parameters: {
          depthCompare: 'less-equal',
          depthWriteEnabled: false,
          cullMode: 'none',
          blend: true,
          blendColorSrcFactor: 'src-alpha',
          blendColorDstFactor: 'one-minus-src-alpha',
          blendAlphaSrcFactor: 'one',
          blendAlphaDstFactor: 'one-minus-src-alpha'
        }
      });
      this.setState({model, corners});
    } catch (error) {
      corners.destroy();
      throw error;
    }
  }

  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (props.segments !== oldProps.segments)
      this.state.model.setAttributes({segments: props.segments});
    this.state.model.setInstanceCount(props.segmentCount);
  }

  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const color = this.props.color!;
    this.state.model.shaderInputs.setProps({
      sketchStroke: this.props.style || {},
      sketchEdge: {
        color: [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
          ((color[3] ?? 255) / 255) * this.props.opacity
        ]
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

const SOURCE = `
struct StrokeVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) weightedCoordinates: vec3<f32>,
  @location(1) @interpolate(flat) metrics: vec2<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
};
@vertex fn vertexMain(
  @location(0) corner: vec2<f32>, @location(1) startPosition: vec3<f32>,
  @location(2) endPosition: vec3<f32>, @location(3) featureIndex: f32, @location(4) seed: f32
) -> StrokeVertex {
  var start = project_position_to_clipspace(startPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  var end = project_position_to_clipspace(endPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  var output: StrokeVertex;
  output.position = vec4<f32>(0.0, 0.0, 2.0, 1.0);
  output.weightedCoordinates = vec3<f32>(0.0, 0.0, 1.0);
  output.metrics = vec2<f32>(0.0, seed);
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  if (start.z < 0.0 && end.z < 0.0) { return output; }
  if (start.z < 0.0) { start = mix(start, end, -start.z / (end.z - start.z)); }
  if (end.z < 0.0) { end = mix(end, start, -end.z / (start.z - end.z)); }
  let viewport = project.viewportSize / project.devicePixelRatio;
  let delta = (end.xy / end.w - start.xy / start.w) * viewport * 0.5;
  let lengthPixels = length(delta);
  if (lengthPixels < 0.01 || min(start.w, end.w) <= 0.0) { return output; }
  let direction = delta / lengthPixels;
  let halfSpan = sketchStroke.width * 0.65 + sketchStroke.jitter * sketchStroke.sketch + 1.0;
  let extension = sketchStroke.extension + 1.0;
  let offset = direction * mix(-extension, extension, corner.x) + vec2<f32>(-direction.y, direction.x) * corner.y * halfSpan;
  var position = mix(start, end, corner.x);
  position = vec4<f32>(position.xy + offset * 2.0 / viewport * position.w, position.z - 0.00001 * position.w, position.w);
  output.position = position;
  let along = corner.x + mix(-extension, extension, corner.x) / lengthPixels;
  output.weightedCoordinates = vec3<f32>(vec2<f32>(along, corner.y * halfSpan) * position.w, position.w);
  output.metrics = vec2<f32>(lengthPixels, seed);
  return output;
}
@fragment fn fragmentMain(input: StrokeVertex) -> @location(0) vec4<f32> {
  let coordinates = input.weightedCoordinates.xy / input.weightedCoordinates.z;
  let coverage = sketchStroke_getCoverage(coordinates, input.metrics.x, input.metrics.y);
  if (coverage < 0.01 || input.metrics.x < 0.01) { discard; }
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  return vec4<f32>(sketchEdge.color.rgb, sketchEdge.color.a * coverage);
}
`;

const VERTEX_SHADER = `#version 300 es
in vec2 corner;
in vec3 startPosition;
in vec3 endPosition;
in float featureIndex;
in float seed;
out vec3 weightedCoordinates;
flat out vec2 metrics;
flat out vec3 pickingColor;
void main() {
  vec4 start = project_position_to_clipspace(startPosition, vec3(0.0), vec3(0.0));
  vec4 end = project_position_to_clipspace(endPosition, vec3(0.0), vec3(0.0));
  gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  weightedCoordinates = vec3(0.0, 0.0, 1.0);
  metrics = vec2(0.0, seed);
  pickingColor = picking_getPickingColorFromIndex(featureIndex);
  float startDistance = start.z + start.w;
  float endDistance = end.z + end.w;
  if (startDistance < 0.0 && endDistance < 0.0) return;
  if (startDistance < 0.0) start = mix(start, end, -startDistance / (endDistance - startDistance));
  if (endDistance < 0.0) end = mix(end, start, -endDistance / ((start.z + start.w) - endDistance));
  vec2 viewport = project.viewportSize / project.devicePixelRatio;
  vec2 delta = (end.xy / end.w - start.xy / start.w) * viewport * 0.5;
  float lengthPixels = length(delta);
  if (lengthPixels < 0.01 || min(start.w, end.w) <= 0.0) return;
  vec2 direction = delta / lengthPixels;
  float halfSpan = sketchStroke.width * 0.65 + sketchStroke.jitter * sketchStroke.sketch + 1.0;
  float extension = sketchStroke.extension + 1.0;
  vec2 offset = direction * mix(-extension, extension, corner.x) + vec2(-direction.y, direction.x) * corner.y * halfSpan;
  vec4 position = mix(start, end, corner.x);
  position.xy += offset * 2.0 / viewport * position.w;
  position.z -= 0.00002 * position.w;
  gl_Position = position;
  float along = corner.x + mix(-extension, extension, corner.x) / lengthPixels;
  weightedCoordinates = vec3(vec2(along, corner.y * halfSpan) * position.w, position.w);
  metrics = vec2(lengthPixels, seed);
}
`;
const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec3 weightedCoordinates;
flat in vec2 metrics;
flat in vec3 pickingColor;
out vec4 fragColor;
void main() {
  float coverage = sketchStroke_getCoverage(weightedCoordinates.xy / weightedCoordinates.z, metrics.x, metrics.y);
  if (coverage < 0.01 || metrics.x < 0.01) discard;
  if (picking.isActive > 0.5) {
    if (all(equal(pickingColor, vec3(0.0)))) discard;
    fragColor = vec4(pickingColor / 255.0, 1.0);
  } else {
    fragColor = vec4(sketchEdge.color.rgb, sketchEdge.color.a * coverage);
  }
}
`;
