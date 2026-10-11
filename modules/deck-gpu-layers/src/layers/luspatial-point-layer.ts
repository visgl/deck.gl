// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type Color,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters,
  type Viewport
} from '@deck.gl/core';
import {Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import type {DrawCommandBuffer} from '@luma.gl/gpgpu/gpu-core';

/** Properties accepted by {@link LuSpatialPointLayer}. */
export type LuSpatialPointLayerProps = Omit<LayerProps, 'data'> & {
  /** Caller-owned packed `vec2<f32>` rows in the layer's Deck coordinate system. */
  positions: Buffer;
  /**
   * Caller-owned `u32` row indices into {@link positions}, selected for rendering.
   *
   * Deck's RGB24 picking can represent indices through `16_777_214`. Larger indices still render,
   * but are not pickable.
   */
  pointIds: Buffer;
  /**
   * Caller-owned non-indexed draw records whose instance count is normally GPU-written.
   * The selected record must keep `vertexCount: 6` and `firstVertex: 0`.
   */
  drawCommands: DrawCommandBuffer;
  /** Indirect command record to replay. Defaults to `0`. */
  commandIndex?: number;
  /** Constant point color in Deck's byte-color convention. */
  color?: Color;
  /** Point radius in device-independent pixels. */
  radiusPixels?: number;
  /**
   * Per-draw multiplier for {@link radiusPixels}. A callback can adapt density to the current
   * viewport without rebuilding the layer. Defaults to `1`.
   */
  radiusScale?: number | ((viewport: Viewport) => number);
  /** Radius multiplier for Deck's auto-highlighted point. Defaults to `1`. */
  highlightRadiusScale?: number;
  /**
   * Keeps initialized resources out of render and picking passes until
   * {@link LuSpatialPointLayer.reveal} is called.
   */
  staged?: boolean;
  /** Called synchronously after this layer has created all of its owned render resources. */
  onResourcesReady?: () => void;
};

type LuSpatialPointLayerState = {
  model: Model | null;
  styleUniforms: Buffer | null;
  staged: boolean;
};

const POINT_BLEND_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

const LUSPATIAL_POINT_SHADER = /* wgsl */ `
struct PointStyleUniforms {
  color: vec4<f32>,
  radiusPixels: f32,
  opacity: f32,
  pickingActive: f32,
  highlightRadiusScale: f32,
};

@group(0) @binding(auto) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> pointIds: array<u32>;
@group(0) @binding(auto) var<uniform> pointStyle: PointStyleUniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) pointCoordinate: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
  @location(3) @interpolate(flat) highlighted: f32,
};

fn getPointCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}

fn encodePickingColor(sourceIndex: u32) -> vec3<f32> {
  if (sourceIndex > 16777214u) {
    return vec3<f32>(0.0);
  }
  let colorIndex = sourceIndex + 1u;
  return vec3<f32>(
    f32(colorIndex % 256u),
    f32((colorIndex / 256u) % 256u),
    f32((colorIndex / 65536u) % 256u)
  ) / 255.0;
}

fn blendHighlightColor(color: vec4<f32>) -> vec4<f32> {
  let highlightAlpha = picking.highlightColor.a;
  let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
  if (blendedAlpha <= 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }
  let highlightRatio = highlightAlpha / blendedAlpha;
  return vec4<f32>(mix(color.rgb, picking.highlightColor.rgb, highlightRatio), blendedAlpha);
}

@vertex fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let sourceIndex = pointIds[instanceIndex];
  let sourcePosition = positions[sourceIndex];
  let pointCorner = getPointCorner(vertexIndex);
  let pickingColor = encodePickingColor(sourceIndex);
  let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  let highlighted = picking.isHighlightActive > 0.5 &&
    distance(pickingColor, highlightedObjectColor) < 0.00001;
  let radiusScale = select(1.0, pointStyle.highlightRadiusScale, highlighted);

  geometry.worldPosition = vec3<f32>(sourcePosition, 0.0);
  geometry.pickingColor = pickingColor;
  var clipPosition = project_position_to_clipspace(
    vec3<f32>(sourcePosition, 0.0),
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  let clipOffset = project_pixel_size_to_clipspace(
    pointCorner * pointStyle.radiusPixels * radiusScale
  );
  clipPosition = vec4<f32>(clipPosition.xy + clipOffset, clipPosition.z, clipPosition.w);

  var output: VertexOutput;
  output.position = clipPosition;
  output.pointCoordinate = pointCorner;
  output.color = pointStyle.color;
  output.pickingColor = pickingColor;
  output.highlighted = select(0.0, 1.0, highlighted);
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  let radiusSquared = dot(input.pointCoordinate, input.pointCoordinate);
  if (radiusSquared > 1.0) {
    discard;
  }
  if (pointStyle.pickingActive > 0.5) {
    if (dot(input.pickingColor, vec3<f32>(1.0)) <= 0.0) {
      discard;
    }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  let coverage = 1.0 - smoothstep(0.18, 1.0, radiusSquared);
  var color = vec4<f32>(input.color.rgb, input.color.a * pointStyle.opacity * coverage);
  if (input.highlighted > 0.5) {
    color = blendHighlightColor(color);
  }
  return color;
}`;

/**
 * WebGPU-only Deck layer that renders GPU-selected position-row indices with an indirect draw.
 *
 * The position, ID, and command buffers are borrowed. Finalizing the layer never destroys them.
 */
export class LuSpatialPointLayer extends Layer<LuSpatialPointLayerProps> {
  static override layerName = 'LuSpatialPointLayer';
  static override defaultProps = {
    data: {type: 'object', value: null, optional: true},
    commandIndex: 0,
    color: {type: 'color', value: [255, 255, 255, 255]},
    radiusPixels: {type: 'number', value: 1, min: 0},
    radiusScale: {type: 'accessor', value: 1},
    highlightRadiusScale: {type: 'number', value: 1, min: 0},
    parameters: POINT_BLEND_PARAMETERS
  };

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') {
      throw new Error('LuSpatialPointLayer requires WebGPU');
    }
    assertNonIndexedDrawCommands(this.props.drawCommands);

    let styleUniforms: Buffer | null = null;
    let model: Model | null = null;
    try {
      styleUniforms = device.createBuffer({
        id: `${this.id}-style-uniforms`,
        byteLength: 32,
        usage: Buffer.UNIFORM | Buffer.COPY_DST
      });
      model = new Model(device, {
        ...this.getShaders({modules: [project32, picking], source: LUSPATIAL_POINT_SHADER}),
        id: `${this.id}-model`,
        topology: 'triangle-list',
        isInstanced: true,
        vertexCount: 6,
        instanceCount: 0,
        bufferLayout: [],
        bindings: {
          positions: this.props.positions,
          pointIds: this.props.pointIds,
          pointStyle: styleUniforms
        },
        parameters: POINT_BLEND_PARAMETERS
      });
      this.setState({
        model,
        styleUniforms,
        staged: Boolean(this.props.staged)
      } satisfies LuSpatialPointLayerState);
    } catch (error) {
      model?.destroy();
      styleUniforms?.destroy();
      throw error;
    }

    this.props.onResourcesReady?.();
  }

  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (props.drawCommands !== oldProps.drawCommands) {
      assertNonIndexedDrawCommands(props.drawCommands);
    }
    const {model} = this.state as LuSpatialPointLayerState;
    if (model && (props.positions !== oldProps.positions || props.pointIds !== oldProps.pointIds)) {
      model.setBindings({positions: props.positions, pointIds: props.pointIds});
    }
    if (props.staged !== oldProps.staged) {
      if (props.staged) {
        this.setState({staged: true});
      } else {
        this.reveal();
      }
    }
  }

  /** Reveals a staged layer after every layer in a related resource revision is ready. */
  reveal(): void {
    if (!(this.state as LuSpatialPointLayerState).staged) {
      return;
    }
    this.setState({staged: false});
    this.setNeedsRedraw();
  }

  override getModels(): Model[] {
    const model = (this.state as LuSpatialPointLayerState).model;
    return model ? [model] : [];
  }

  override draw({
    renderPass,
    shaderModuleProps
  }: {
    renderPass: RenderPass;
    shaderModuleProps?: {picking?: {isActive?: number | boolean}};
  }): void {
    const {model, styleUniforms, staged} = this.state as LuSpatialPointLayerState;
    if (staged) {
      return;
    }
    if (!model || !styleUniforms) {
      return;
    }

    const [red, green, blue, alpha = 255] = this.props.color ?? [255, 255, 255, 255];
    const radiusScale =
      typeof this.props.radiusScale === 'function'
        ? this.props.radiusScale(this.context.viewport)
        : (this.props.radiusScale ?? 1);
    styleUniforms.write(
      new Float32Array([
        red / 255,
        green / 255,
        blue / 255,
        alpha / 255,
        (this.props.radiusPixels ?? 1) * radiusScale,
        this.props.opacity ?? 1,
        shaderModuleProps?.picking?.isActive ? 1 : 0,
        this.props.highlightRadiusScale ?? 1
      ])
    );
    model.setInstanceCount(0);
    if (model.draw(renderPass)) {
      this.props.drawCommands.draw(renderPass, this.props.commandIndex ?? 0);
    }
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    return info;
  }

  override finalizeState(context: LayerContext): void {
    const state = this.state as LuSpatialPointLayerState;
    state.model?.destroy();
    state.styleUniforms?.destroy();
    this.setState({
      model: null,
      styleUniforms: null,
      staged: false
    } satisfies LuSpatialPointLayerState);
    super.finalizeState(context);
  }
}

function assertNonIndexedDrawCommands(drawCommands: DrawCommandBuffer): void {
  if (drawCommands.type !== 'draw') {
    throw new Error('LuSpatialPointLayer requires non-indexed draw commands');
  }
}
