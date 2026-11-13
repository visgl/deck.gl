// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  createIterable,
  type Layer,
  _isArrowVector as isArrowVector,
  _deepEqual as deepEqual
} from '@deck.gl/core';

/** A numeric or string cell, or a feature containing multiple cells. */
export type CellValue = string | bigint | Iterable<string | bigint>;

/** Returns whether a cell identifier or style accessor supplies an Arrow vector. */
export function hasCellColumns(props: Record<string, any>, accessor: string): boolean {
  return [accessor, 'getFillColor', 'getLineColor', 'getLineWidth', 'getElevation'].some(name =>
    isArrowVector(props[name])
  );
}

/** Reads a constant, row callback, or Arrow cell identifier at a source row. */
export function getCellValue(input: any, row: any, info: {index: number; data?: unknown}): any {
  return typeof input === 'function'
    ? input(row, info)
    : isArrowVector(input)
      ? input.get(info.index)
      : input;
}

/** Expands cell rows while retaining the source feature for styling and picking. */
export function renderCellColumns(
  layer: CompositeLayer,
  accessor: string,
  cluster: boolean,
  callbacks: {
    row: (value: any, source: any, index: number) => any;
    accessor: (value: any) => any;
    props: (value: any) => any;
  }
): Layer {
  const props = layer.props as Record<string, any>;
  const rows =
    props.data && typeof props.data.get === 'function'
      ? Array.from({length: props.data.numRows}, (_, index) => props.data.get(index))
      : Array.from(createIterable(props.data).iterable);
  const cellInput = props[accessor];
  const arrowInputs = [
    cellInput,
    props.getFillColor,
    props.getLineColor,
    props.getLineWidth,
    props.getElevation
  ].filter(isArrowVector);
  const length = arrowInputs[0]?.length ?? rows.length;
  const {objectInfo} = createIterable(null);
  objectInfo.data = props.data;
  const cells = {
    length,
    get: (index: number) => {
      objectInfo.index = index;
      return getCellValue(cellInput, rows[index], objectInfo);
    }
  };
  if (rows.length && rows.length !== cells.length)
    throw new Error('cells and data lengths must match');
  const styles = ['getFillColor', 'getLineColor', 'getLineWidth', 'getElevation'] as const;
  for (const name of styles) {
    if (isArrowVector(props[name]) && props[name].length !== cells.length)
      throw new Error(`${name} and cells lengths must match`);
  }
  const data: unknown[] = [];
  for (let index = 0; index < cells.length; index++) {
    const value = cells.get(index);
    if (value === null || value === undefined) throw new Error('cells cannot contain nulls');
    const values =
      typeof value === 'string' || typeof value === 'bigint' ? [value] : Array.from(value);
    const ids = values.map(cell => {
      if (typeof cell !== 'string' && typeof cell !== 'bigint')
        throw new Error('cells must contain strings or 64-bit integers');
      if (typeof cell === 'string') return cell;
      const cellId = BigInt.asUintN(64, cell);
      if (accessor === 'getPentagon') return cellId;
      if (accessor === 'getS2Token')
        return cellId.toString(16).padStart(16, '0').replace(/0+$/, '');
      if (accessor === 'getHexagon' || accessor === 'getHexagons') return cellId.toString(16);
      throw new Error('This grid requires string cells');
    });
    for (const cell of cluster ? [ids] : ids) {
      data.push(
        callbacks.row(
          {cell, sourceIdentity: typeof props.data?.get === 'function' ? props.data : rows[index]},
          rows[index],
          index
        )
      );
    }
  }
  const styleProps: Record<string, unknown> = {};
  for (const name of styles) {
    const column = isArrowVector(props[name]) ? props[name] : null;
    styleProps[name] = callbacks.accessor(
      column
        ? (_: unknown, info: {index: number; data?: unknown}) => {
            const value = column.get(info.index);
            if (value === null || value === undefined)
              throw new Error('Cell styles cannot contain nulls');
            return name === 'getElevation' || name === 'getLineWidth'
              ? Number(value)
              : Array.from(value, Number);
          }
        : props[name]
    );
  }
  const CellLayer = layer.constructor as new (props: any) => Layer;
  return new CellLayer({
    ...props,
    ...callbacks.props({
      id: 'columns',
      updateTriggers: Object.fromEntries(
        styles.map(name => [name, [props[name], props.updateTriggers?.[name]]])
      )
    }),
    data,
    dataTransform: undefined,
    // Compare semantic rows: fresh expansion alone must not invalidate geometry.
    dataComparator: (next, previous) =>
      next.length === previous.length &&
      next.every((row, index) => {
        const oldRow = previous[index];
        return (
          deepEqual(row.cell, oldRow.cell, -1) &&
          row.sourceIdentity === oldRow.sourceIdentity &&
          row.__source?.index === oldRow.__source?.index
        );
      }),
    _dataDiff: undefined,
    [accessor]: (row: {cell: unknown}) => row.cell,
    ...styleProps
  });
}
