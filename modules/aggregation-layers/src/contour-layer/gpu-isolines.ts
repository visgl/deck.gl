// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {ISOLINES_CODE_OFFSET_MAP} from './marching-squares-codes';

/** Invocations dispatched in one workgroup. */
const WORKGROUP_SIZE = 64;
/** Maximum number of disconnected line segments from one marching cell. */
const SEGMENTS_PER_CELL = 2;
/** Byte stride of two XYZ endpoints and the line width. */
const SEGMENT_BYTES = 28;

/** Grid, threshold, and style uniforms for one isoline. */
const uniforms = {
  name: 'isolines',
  source: `struct IsolineUniforms {
    grid: vec4i,
    threshold: f32,
    z: f32,
    strokeWidth: f32,
    dispatchWidth: u32,
  };
  @group(0) @binding(auto) var<uniform> isolines: IsolineUniforms;`,
  uniformTypes: {
    grid: 'vec4<i32>',
    threshold: 'f32',
    z: 'f32',
    strokeWidth: 'f32',
    dispatchWidth: 'u32'
  }
} as const;

// Use the same edge intersections and ambiguity rule as the CPU implementation.
/** Generate a lookup with two segment slots per square case and mean classification. */
const offsets = Object.values(ISOLINES_CODE_OFFSET_MAP).flatMap(entry =>
  [0, 1].flatMap(mean => {
    const segments = Array.isArray(entry) ? entry : entry[mean];
    return [0, 1].map(index => {
      const segment = segments[index] || [
        [0, 0],
        [0, 0]
      ];
      return `vec4f(${segment
        .flat()
        .map(value => value.toFixed(1))
        .join(', ')})`;
    });
  })
);

/** March occupied bins and write instanced line attributes. */
const source = /* wgsl */ `
@group(0) @binding(auto) var<storage, read> values: array<u32>;
@group(0) @binding(auto) var<storage, read_write> segments: array<f32>;

const intersections = array<vec4f, ${offsets.length}>(${offsets.join(',\n')});

fn sample(point: vec2i) -> u32 {
  let size = isolines.grid.zw;
  if (any(point < vec2i(0)) || any(point >= size)) {
    return 0x7fc00000u;
  }
  return values[u32(point.y * size.x + point.x)];
}

fn missing(value: u32) -> bool {
  return (value & 0x7fffffffu) > 0x7f800000u;
}

fn classify(value: u32) -> u32 {
  if (missing(value)) { return 0u; }
  return select(0u, 1u, bitcast<f32>(value) >= isolines.threshold);
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.y * isolines.dispatchWidth + id.x;
  let size = vec2u(isolines.grid.zw) + vec2u(1);
  if (index >= size.x * size.y) { return; }

  let cell = vec2i(i32(index % size.x), i32(index / size.x));
  let top = sample(cell - vec2i(1, 0));
  let topRight = sample(cell);
  let right = sample(cell - vec2i(0, 1));
  let current = sample(cell - vec2i(1, 1));
  let code = (classify(top) << 3u) | (classify(topRight) << 2u) |
    (classify(right) << 1u) | classify(current);
  var mean = 0u;
  if (!missing(top) && !missing(topRight) && !missing(right) && !missing(current)) {
    let average = dot(bitcast<vec4f>(vec4u(top, topRight, right, current)), vec4f(0.25));
    mean = classify(bitcast<u32>(average));
  }
  let origin = vec2f(cell + isolines.grid.xy);
  for (var slot = 0u; slot < 2u; slot++) {
    let offset = intersections[code * 4u + mean * 2u + slot];
    let activeSegment = any(offset.xy != offset.zw);
    let start = origin + offset.xy;
    let end = origin + select(vec2f(0.5, 0.0), offset.zw, activeSegment);
    let base = (index * 2u + slot) * 7u;
    segments[base] = start.x;
    segments[base + 1u] = start.y;
    segments[base + 2u] = isolines.z;
    segments[base + 3u] = end.x;
    segments[base + 4u] = end.y;
    segments[base + 5u] = isolines.z;
    segments[base + 6u] = select(0.0, isolines.strokeWidth, activeSegment);
  }
}
`;

/** Minimum X and Y indices followed by the unpadded grid width and height. */
type Grid = [number, number, number, number];

/** GPU-resident line columns for one contour threshold. */
export class GPUIsolines {
  /** Whether the padded grid fits one storage binding and compute dispatch. */
  static supports(device: Device, cellCount: number): boolean {
    const {maxBufferSize, maxStorageBufferBindingSize, maxComputeWorkgroupsPerDimension} =
      device.limits;
    return (
      Number.isSafeInteger(cellCount) &&
      cellCount > 0 &&
      cellCount * SEGMENTS_PER_CELL * SEGMENT_BYTES <=
        Math.min(maxBufferSize, maxStorageBufferBindingSize) &&
      Math.ceil(cellCount / WORKGROUP_SIZE) <= maxComputeWorkgroupsPerDimension ** 2
    );
  }

  /** Segment start positions in grid coordinates. */
  readonly sourcePositions: GPUVector<'float32x3'>;
  /** Segment end positions in grid coordinates. */
  readonly targetPositions: GPUVector<'float32x3'>;
  /** Segment widths in pixels. Unused slots have zero width. */
  readonly widths: GPUVector<'float32'>;
  /** Interleaved storage and vertex buffer shared by the output vectors. */
  private readonly buffer: Buffer;
  /** Compute pipeline for the marching squares pass. */
  private readonly computation: Computation;

  constructor(
    private readonly device: Device,
    readonly cellCount: number
  ) {
    const length = cellCount * SEGMENTS_PER_CELL;
    this.buffer = device.createBuffer({
      byteLength: length * SEGMENT_BYTES,
      usage: Buffer.STORAGE | Buffer.VERTEX | Buffer.COPY_SRC
    });
    const props = {
      type: 'buffer' as const,
      length,
      buffer: this.buffer,
      ownsBuffer: false,
      byteStride: SEGMENT_BYTES
    };
    this.sourcePositions = new GPUVector({...props, name: 'sourcePositions', format: 'float32x3'});
    this.targetPositions = new GPUVector({
      ...props,
      name: 'targetPositions',
      format: 'float32x3',
      byteOffset: 12
    });
    this.widths = new GPUVector({...props, name: 'widths', format: 'float32', byteOffset: 24});
    this.computation = new Computation(device, {
      id: 'contour-isolines',
      source,
      modules: [uniforms]
    });
  }

  /** Read finalized bin weights and overwrite all segment slots. */
  run(values: GPUVector, grid: Grid, threshold: number, z: number, strokeWidth: number): void {
    const groups = Math.ceil(this.cellCount / WORKGROUP_SIZE);
    const width = Math.min(groups, this.device.limits.maxComputeWorkgroupsPerDimension);
    this.computation.setBindings({
      values: getGPUVectorData(values).buffer as Buffer,
      segments: this.buffer
    });
    this.computation.shaderInputs.setProps({
      isolines: {grid, threshold, z, strokeWidth, dispatchWidth: width * WORKGROUP_SIZE}
    });
    const encoder = this.device.createCommandEncoder();
    try {
      this.computation.predraw(encoder);
      const pass = encoder.beginComputePass();
      this.computation.dispatch(pass, width, Math.ceil(groups / width));
      pass.end();
      this.device.submit(encoder.finish());
    } finally {
      encoder.destroy();
    }
  }

  /** Release the output columns and compute pipeline. */
  destroy(): void {
    this.computation.destroy();
    this.sourcePositions.destroy();
    this.targetPositions.destroy();
    this.widths.destroy();
    this.buffer.destroy();
  }
}
