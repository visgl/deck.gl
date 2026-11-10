// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {DataType} from 'apache-arrow';
import {isNumericArrowType} from '@luma.gl/graph/arrow';
import type {GPUVectorFormat} from '@luma.gl/graph/gpu-data';
import type {ArrowConverterOptions} from './arrow-converter';

/**
 * Validates schema metadata and returns the converter's output format.
 * Does not read values or allocate GPU resources. Nulls and transformed values
 * remain subject to upload-time validation.
 */
export function getArrowConversionFormat(
  type: DataType,
  options: ArrowConverterOptions = {}
): GPUVectorFormat {
  const {semantic = 'auto', ...conversion} = options;
  if (
    semantic === 'position' &&
    (!DataType.isFixedSizeList(type) || ![2, 3].includes(type.listSize))
  ) {
    throw new Error('Arrow positions must be FixedSizeList[2] or FixedSizeList[3]');
  }
  if (semantic === 'scalar' && !isNumericArrowType(type)) {
    throw new Error('Arrow scalar input must be numeric');
  }
  let format = conversion.format;
  if (!format) {
    if (semantic === 'color') format = 'unorm8x4';
    if (semantic === 'scalar') format = 'float32';
    if (semantic === 'position') {
      format = DataType.isFixedSizeList(type) && type.listSize === 2 ? 'float32x2' : 'float32x3';
    }
  }
  if (!format) {
    const width = DataType.isFixedSizeList(type) ? type.listSize : 1;
    format = (width === 1 ? 'float32' : `float32x${width}`) as GPUVectorFormat;
  }
  const color = semantic === 'color' || format === 'unorm8x4';
  const width = format === 'float32' ? 1 : Number(/x([234])$/.exec(format)?.[1]);
  if (!width || (color ? format !== 'unorm8x4' : !format.startsWith('float32')))
    throw new Error(`Unsupported Arrow output format: ${format}`);
  const list = DataType.isFixedSizeList(type);
  const sourceWidth = list ? type.listSize : 1;
  const childType = list ? type.children[0].type : type;
  if (!isNumericArrowType(childType)) throw new Error('Arrow input must contain numeric values');
  if (
    (!color && !conversion.transform && sourceWidth > width) ||
    (color && ![3, 4].includes(sourceWidth))
  )
    throw new Error('Arrow input width does not match the requested output format');
  return format;
}
