// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';

/** Global row and physical chunk provenance attached to GPUVector layer picking results. */
export type GPUVectorLayerPickingInfo = PickingInfo & {
  gpuVector?: {rowIndex: number; batchIndex: number; batchRowIndex: number};
};

/** Resolves global picking identity back to a physical GPUVector chunk. */
export function getGPUVectorPickingProvenance(
  vector: GPUVector,
  rowIndex: number
): {rowIndex: number; batchIndex: number; batchRowIndex: number} {
  let rowIndexOffset = 0;
  for (const [batchIndex, data] of vector.data.entries()) {
    if (rowIndex < rowIndexOffset + data.length) {
      return {rowIndex, batchIndex, batchRowIndex: rowIndex - rowIndexOffset};
    }
    rowIndexOffset += data.length;
  }
  return {rowIndex, batchIndex: -1, batchRowIndex: -1};
}
