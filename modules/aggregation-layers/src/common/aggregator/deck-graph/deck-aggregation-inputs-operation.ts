// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_GPUVectorModel as GPUVectorModel} from '@deck.gl/core';
import {Buffer, Texture} from '@luma.gl/core';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import type {
  GPUOperation,
  GPUOperationContract,
  GPUOperationLowering
} from '@luma.gl/graph/gpu-graph';
import type {AggregationShaderContext} from '../aggregator';
import {aggregationUniforms} from '../webgpu-aggregator/aggregation-uniforms';

/** Per-encoding layer inputs; logical ports stay stable while uniforms and attributes change. */
export type DeckAggregationInputs = ReturnType<AggregationShaderContext['getAttributeBindings']> & {
  context: AggregationShaderContext;
  shaderModuleProps: Record<string, any>;
  settings: Record<string, any>;
};

/** Signals an incomplete model without publishing partially encoded aggregation results. */
export class AggregationInputsNotReady extends Error {}

const source = /* wgsl */ `
@group(0) @binding(auto) var<storage, read> keys: array<u32>;
@group(0) @binding(auto) var<storage, read_write> contributions: array<f32>;
@group(0) @binding(auto) var<storage, read_write> selection: array<u32>;
struct Attributes {
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3f,
  @location(1) positions64Low: vec3f,
  @location(2) counts: f32,
};
struct Varyings {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat) row: u32,
  @location(1) weights: vec4f,
};
@vertex fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;
  geometry.worldPosition = attributes.positions;
  geometry.position = vec4f(project_position_vec3_f64(attributes.positions, attributes.positions64Low), 1.0);
  geometry.uv = vec2f(0.0);
  var clip = project_common_position_to_clipspace(geometry.position);
  DECKGL_FILTER_GL_POSITION(&clip, geometry);
  let corners = array<vec2f, 6>(vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0), vec2f(-1.0,1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0));
  varyings.position = vec4f(corners[attributes.vertexIndex], 0.0, 1.0);
  varyings.row = attributes.instanceIndex;
  varyings.weights = vec4f(attributes.counts, 1.0, 1.0, 1.0);
  return varyings;
}
@fragment fn fragmentMain(varyings: Varyings) -> @location(0) vec4f {
  if (keys[varyings.row] >= aggregation.counts.y) { return vec4f(0.0); }
  fragmentGeometry.uv = vec2f(0.0);
  var color = varyings.weights;
  DECKGL_FILTER_COLOR(&color, fragmentGeometry);
  contributions[varyings.row] = color.x;
  selection[varyings.row] = 1u;
  return vec4f(0.0);
}`;

/** Deck input hooks producing the mask and weights consumed by generic grouped reductions. */
export class DeckAggregationInputsOperation implements GPUOperation {
  readonly type = 'deck-aggregation-inputs';
  readonly id = 'deck-aggregation-inputs';
  constructor(readonly inputs: DeckAggregationInputs) {}
  get contract(): GPUOperationContract {
    return {
      values: [
        {value: 'keys', access: 'read'},
        {value: 'contributions', access: 'write'},
        {value: 'selection', access: 'write'}
      ]
    };
  }
}

/** Concrete borrowed attribute buffers whose identities determine graph resource declarations. */
export function getAggregationAttributeBuffers(
  attributes: DeckAggregationInputs['attributes']
): Buffer[] {
  const buffers = new Set<Buffer>();
  for (const vector of Object.values(attributes)) {
    if (vector instanceof GPUVector) {
      const {buffer} = getGPUVectorData(vector);
      if (buffer instanceof Buffer) buffers.add(buffer);
    }
  }
  return [...buffers];
}

/** Lower deck hooks to an ordinary graph render node with explicit buffer dependencies. */
export const deckAggregationInputsLowering: GPUOperationLowering = {
  type: 'deck-aggregation-inputs',
  lower(operation, context) {
    const {inputs, id} = operation as DeckAggregationInputsOperation;
    const keys = context.resolveVector<'uint32'>('keys').data[0];
    const contributions = context.resolveVector<'float32'>('contributions').data[0];
    const selection = context.resolveVector<'uint32'>('selection').data[0];
    const attributes = getAggregationAttributeBuffers(inputs.attributes).map((buffer, index) => ({
      buffer: context.graph.importBuffer(
        {id: `${id}-attribute-${index}`, byteLength: buffer.byteLength, usage: buffer.usage},
        buffer
      ),
      usage: buffer.usage & Buffer.VERTEX ? ('vertex' as const) : ('storage-read' as const)
    }));
    const target = context.graph.createTransientTexture({
      id: `${id}-target`,
      format: 'rgba8unorm',
      width: 1,
      height: 1,
      usage: Texture.RENDER_ATTACHMENT
    });
    context.graph.addRenderPass({
      id,
      attachments: {colorAttachments: [context.graph.createTextureView(target)]},
      resources: [
        {buffer: keys, usage: 'storage-read'},
        {buffer: contributions, usage: 'storage-write'},
        {buffer: selection, usage: 'storage-write'},
        ...attributes
      ],
      compile({device}) {
        const model = new GPUVectorModel(device, {
          ...inputs.context.shaders,
          id,
          source,
          modules: [...(inputs.context.shaders.modules || []), aggregationUniforms],
          vertexCount: 6,
          isInstanced: true,
          topology: 'triangle-list',
          colorAttachmentFormats: ['rgba8unorm'],
          parameters: {depthWriteEnabled: false}
        });
        return {
          getRenderPassProps({commandEncoder, getBuffer}) {
            model.setGPUAttributes(inputs.attributes, inputs.bufferLayouts);
            model.setInstanceCount(inputs.settings.counts[0]);
            model.setBindings({
              keys: getBuffer(keys),
              contributions: getBuffer(contributions),
              selection: getBuffer(selection)
            });
            model.shaderInputs.setProps({
              ...inputs.shaderModuleProps,
              aggregation: inputs.settings
            });
            model.predraw(commandEncoder);
            return {clearColor: [0, 0, 0, 0]};
          },
          encode({renderPass}) {
            if (!model.draw(renderPass))
              throw new AggregationInputsNotReady('Aggregation shader inputs are not ready');
          },
          destroy: () => model.destroy()
        };
      }
    });
  }
};
