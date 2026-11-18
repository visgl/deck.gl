// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  createIterable,
  _isArrowVector as isArrowVector,
  type _ColumnDefinition as ColumnDefinition
} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {MATRIX_ATTRIBUTES, getMeshInstanceTransform} from './matrix';

/** Accessors that compose a mesh instance transform. */
export const TRANSFORM_ACCESSORS = [
  'getTransformMatrix',
  'getOrientation',
  'getScale',
  'getTranslation'
] as const;
const TRANSFORM_ATTRIBUTES = Object.keys(MATRIX_ATTRIBUTES.shaderAttributes);
/** Shared instance column schema for mesh and scenegraph models. */
export const MESH_COLUMN_DEFINITIONS: Record<string, ColumnDefinition> = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    arrowAccessor: true,
    semantic: 'position',
    size: 3
  },
  colors: {
    attribute: 'instanceColors',
    accessor: 'getColor',
    arrowAccessor: true,
    semantic: 'color',
    size: 4
  }
};
for (const attribute of TRANSFORM_ATTRIBUTES) {
  MESH_COLUMN_DEFINITIONS[attribute] = {
    attribute,
    accessor: attribute,
    semantic: 'vector',
    size: 3,
    prop: false
  };
}

/** Packs transform accessor fallbacks into shared instance-vector bindings. */
export function prepareMeshColumnTransforms(
  device: Device,
  props: Record<string, any>,
  rows: {at(index: number): unknown},
  length: number,
  own: (buffer: Buffer) => void
) {
  const binary = (props.data as any)?.attributes?.instanceModelMatrix;
  let descriptor =
    binary instanceof Buffer
      ? {buffer: binary}
      : ArrayBuffer.isView(binary)
        ? {value: binary}
        : binary;
  if (!descriptor) {
    const accessors = TRANSFORM_ACCESSORS.map(name => props[name]);
    const constant =
      (!isArrowVector(accessors[0]) &&
        typeof accessors[0] !== 'function' &&
        accessors[0]?.length === 16) ||
      accessors.every(accessor => Array.isArray(accessor));
    const count = constant ? 1 : length;
    const values = new Float32Array(count * 12);
    const {objectInfo: info} = createIterable(props.data);
    for (let index = 0; index < count; index++) {
      info.index = index;
      const row = rows.at(index);
      const matrix = readTransformAccessor(accessors[0], row, info, length, 16, []);
      const [orientation, scale, translation] =
        matrix?.length === 16
          ? [[], [], []]
          : accessors
              .slice(1)
              .map((accessor, accessorIndex) =>
                readTransformAccessor(
                  accessor,
                  row,
                  info,
                  length,
                  3,
                  accessorIndex === 1 ? [1, 1, 1] : [0, 0, 0]
                )
              );
      values.set(getMeshInstanceTransform(matrix, orientation, scale, translation), index * 12);
    }
    descriptor = {value: values, constant};
  }
  if (!descriptor.constant && !descriptor.buffer && length) {
    const buffer = device.createBuffer({
      data: descriptor.value,
      usage: Buffer.VERTEX | Buffer.COPY_DST
    });
    own(buffer);
    descriptor = {...descriptor, buffer};
  }
  return Object.fromEntries(
    TRANSFORM_ATTRIBUTES.map((name, index) => [
      name,
      {
        ...descriptor,
        size: 3,
        stride: descriptor.stride ?? 48,
        offset: (descriptor.offset ?? 0) + index * 12
      }
    ])
  );
}

/** Reads an Arrow transform row while preserving callback and constant semantics. */
function readTransformAccessor(
  accessor: any,
  row: unknown,
  info: {index: number},
  length: number,
  size: number,
  fallback: number[]
): number[] {
  if (!isArrowVector(accessor)) {
    return typeof accessor === 'function' ? accessor(row, info) : accessor;
  }
  if (accessor.length !== length) {
    throw new Error('Mesh transform column length must match data');
  }
  const value = accessor.get(info.index);
  if (value == null) return fallback;
  if ((accessor.type as {listSize?: number}).listSize !== size || value.length !== size) {
    throw new Error('Invalid mesh transform column size');
  }
  return Array.from(value as Iterable<number | bigint | null>, (component, axis) => {
    if (component == null) return size === 16 ? Number(axis % 5 === 0) : fallback[axis];
    if (
      (typeof component !== 'number' && typeof component !== 'bigint') ||
      !Number.isFinite(Number(component))
    ) {
      throw new Error('Mesh transform columns require finite numbers');
    }
    return Number(component);
  });
}
