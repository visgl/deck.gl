// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Buffer, Device} from '@luma.gl/core';
import {
  backendRegistry,
  cleanEvaluateSync,
  fround,
  GPUDataEvaluator,
  interleave
} from '@luma.gl/gpgpu';
import {fround as cpuFround, interleave as cpuInterleave} from '@luma.gl/gpgpu/cpu';
import {fround as webglFround, interleave as webglInterleave} from '@luma.gl/gpgpu/webgl';
import {fround as webgpuFround, interleave as webgpuInterleave} from '@luma.gl/gpgpu/webgpu';
import {toDoublePrecisionArrayCPU} from './math-utils';

const registeredBackendTypes = new Set<string>();
const DEFAULT_GPU_THRESHOLD = 100_000;

export type DoublePrecisionArrayOptions = {
  size?: number;
  startIndex?: number;
  endIndex?: number;
  byteOffset?: number;
  /** Minimum number of source elements to process on the GPU. */
  gpuThreshold?: number;
};

function registerBackend(device: Device): void {
  if (registeredBackendTypes.has(device.type)) {
    return;
  }

  if (device.type === 'webgpu') {
    backendRegistry.add('webgpu', {fround: webgpuFround, interleave: webgpuInterleave});
  } else if (device.type === 'webgl') {
    backendRegistry.add('webgl', {fround: webglFround, interleave: webglInterleave});
  } else {
    throw new Error(`Unsupported device type ${device.type}`);
  }
  registeredBackendTypes.add(device.type);
}

/** Copies a byte range from one GPU buffer into another buffer on the same device. */
export function copyBuffer(
  sourceBuffer: Buffer,
  destinationBuffer: Buffer,
  byteLength: number
): void {
  const device = sourceBuffer.device;
  // WebGPU copies must be word-aligned; luma allocates the corresponding padded storage.
  const copyByteLength = device.type === 'webgpu' ? Math.ceil(byteLength / 4) * 4 : byteLength;
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer({
    sourceBuffer,
    destinationBuffer,
    size: copyByteLength
  });
  device.submit(commandEncoder.finish());
}

/**
 * Writes fp64-style high/low tuples into a pre-allocated GPU buffer.
 * Float32 input is interleaved with zero low parts, while Float64 input is split by fround.
 */
export function toDoublePrecisionArrayGPU(
  buffer: Buffer,
  typedArray: Float32Array | Float64Array,
  options: DoublePrecisionArrayOptions = {}
): void {
  const {size = 1, startIndex = 0, endIndex = typedArray.length, byteOffset = 0} = options;
  const source = GPUDataEvaluator.fromArray(typedArray.subarray(startIndex, endIndex), {size});
  const output =
    typedArray instanceof Float64Array
      ? fround(source)
      : interleave(source, GPUDataEvaluator.fromConstant(new Array(size).fill(0)));

  registerBackend(buffer.device);
  output.setTargetBuffer({buffer, byteOffset});
  cleanEvaluateSync(buffer.device, output);
}

/**
 * Writes fp64-style high/low tuples into a pre-allocated GPU buffer.
 * Small inputs are converted on the CPU to avoid GPU dispatch overhead.
 */
export function toDoublePrecisionArray(
  buffer: Buffer,
  typedArray: Float32Array | Float64Array,
  options: DoublePrecisionArrayOptions = {}
): void {
  const {
    size = 1,
    startIndex = 0,
    endIndex = typedArray.length,
    byteOffset = 0,
    gpuThreshold = DEFAULT_GPU_THRESHOLD
  } = options;

  if (endIndex - startIndex < gpuThreshold) {
    const result = toDoublePrecisionArrayCPU(typedArray, {size, startIndex, endIndex});
    buffer.write(result, byteOffset);
  } else {
    toDoublePrecisionArrayGPU(buffer, typedArray, options);
  }
}
