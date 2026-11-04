// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {subdivideTriangleMesh} from '@math.gl/geometry';
import {projectionEngine} from '@math.gl/geospatial/projection';
import type {ReadonlyCRSDefinition} from '@math.gl/geospatial';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  DataType,
  Field,
  FixedSizeList,
  Float64,
  Float32,
  makeVector,
  vectorFromArray
} from 'apache-arrow';
import type {BitmapBoundingBox} from './bitmap-layer';
import type {BitmapMeshProps, BitmapMeshSource} from './bitmap-layer-mesh';
import createMesh from './create-mesh';

/** Maps input mesh coordinates to an axis-aligned image rectangle in its own CRS. */
export type BitmapImageMapping = {
  /** Image rectangle [left, bottom, right, top] in imageCRS coordinates. */
  bounds: [number, number, number, number];
  /** Explicit CRS of the image rectangle. */
  imageCRS: ReadonlyCRSDefinition;
  /** Explicit CRS of mesh positions before deck.gl transforms. */
  positionCRS: ReadonlyCRSDefinition;
};

/** Optional CPU UV generation and source-space triangle refinement. */
export type BitmapMappingProps = {
  /** Generates UVs instead of accepting explicit texCoords. */
  imageMapping?: BitmapImageMapping | null;
  /** Positive maximum source-space edge length; omitted preserves input segmentation. */
  meshMaxEdgeLength?: number | null;
};

/** Generates UVs for a CPU-readable mesh, optionally refining its source-space triangles. */
export function createMappedBitmapMesh(
  props: BitmapMeshProps & BitmapMappingProps & {bounds: BitmapBoundingBox}
): BitmapMeshProps {
  const {imageMapping: mapping, meshMaxEdgeLength} = props;
  if (!mapping) throw new Error('Bitmap subdivision requires imageMapping');
  if (props.texCoords) throw new Error('Bitmap imageMapping cannot be combined with texCoords');
  const [left, bottom, right, top] = mapping.bounds;
  if (
    !mapping.bounds.every(Number.isFinite) ||
    right <= left ||
    top <= bottom ||
    !mapping.positionCRS ||
    !mapping.imageCRS
  )
    throw new Error('Invalid bitmap imageMapping');
  if (meshMaxEdgeLength != null && (!Number.isFinite(meshMaxEdgeLength) || meshMaxEdgeLength <= 0))
    throw new Error('Bitmap meshMaxEdgeLength must be positive');
  let positions: Float64Array;
  let indices: Uint32Array | null;
  if (props.positions) {
    const source = readArrow(props.positions);
    if (!DataType.isFixedSizeList(source.type) || ![2, 3].includes(source.type.listSize))
      throw new Error('Bitmap positions must have two or three components');
    positions = new Float64Array(source.length * 3);
    for (let i = 0; i < source.length; i++) {
      const row = source.get(i);
      if (!row) throw new Error('Bitmap positions cannot contain nulls');
      for (let component = 0; component < source.type.listSize; component++) {
        const value = row.get(component);
        if (typeof value !== 'number' || !Number.isFinite(value))
          throw new Error('Bitmap positions must be finite');
        positions[i * 3 + component] = value;
      }
    }
    indices = null;
    if (props.indices) {
      const sourceIndices = readArrow(props.indices);
      if (
        !DataType.isInt(sourceIndices.type) ||
        sourceIndices.type.isSigned ||
        ![16, 32].includes(sourceIndices.type.bitWidth)
      )
        throw new Error('Bitmap indices must be uint16 or uint32');
      indices = new Uint32Array(sourceIndices.length);
      for (let i = 0; i < sourceIndices.length; i++) {
        const index = sourceIndices.get(i);
        if (index === null || index >= source.length) throw new Error('Invalid bitmap index');
        indices[i] = index;
      }
    }
  } else {
    if (props.indices) throw new Error('Bitmap indices require positions');
    const bounds = props.bounds;
    const corners =
      typeof bounds[0] === 'number'
        ? [
            [bounds[0], bounds[1]],
            [bounds[0], bounds[3]],
            [bounds[2], bounds[3]],
            [bounds[2], bounds[1]]
          ]
        : bounds;
    ({positions, indices} = createMesh(corners, undefined));
  }
  if ((indices?.length ?? positions.length / 3) % 3)
    throw new Error('Bitmap meshes require complete triangles');
  if (meshMaxEdgeLength != null && positions.length) {
    const refined = subdivideTriangleMesh(
      {
        positions,
        indices: indices ?? Uint32Array.from({length: positions.length / 3}, (_, i) => i)
      },
      {
        transform: position => position,
        tolerance: 1,
        size: 3,
        targetSize: 3,
        maxEdgeLength: meshMaxEdgeLength
      }
    );
    positions = refined.sourcePositions;
    indices = refined.indices;
  }
  const projection = projectionEngine.createProjection({
    from: mapping.positionCRS,
    to: mapping.imageCRS
  });
  const rows: number[][] = [];
  const uvRows: number[][] = [];
  for (let i = 0; i < positions.length; i += 3) {
    const position = Array.from(positions.subarray(i, i + 3));
    const projected = projection.projectSync(position);
    if (!position.every(Number.isFinite) || !projected.every(Number.isFinite))
      throw new Error('Bitmap mapping is outside the projection domain');
    rows.push(position);
    uvRows.push([(projected[0] - left) / (right - left), (top - projected[1]) / (top - bottom)]);
  }
  return {
    positions: vectorFromArray(
      rows,
      new FixedSizeList(3, new Field('value', new Float64(), false))
    ),
    texCoords: vectorFromArray(
      uvRows,
      new FixedSizeList(2, new Field('value', new Float32(), false))
    ),
    indices: indices ? makeVector(indices) : null
  };
}

/** Reads only CPU Arrow storage; GPU vectors are never implicitly downloaded. */
function readArrow(source: BitmapMeshSource) {
  if (source instanceof GPUVector)
    throw new Error('Bitmap imageMapping requires CPU-readable Arrow columns');
  if (source.data.length > 1) throw new Error('Bitmap meshes require single chunks');
  return makeVector(source.data);
}
