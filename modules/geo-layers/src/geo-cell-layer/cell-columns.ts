// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  createIterable,
  type Layer,
  type DefaultProps,
  _deepEqual as deepEqual
} from '@deck.gl/core';

/** CPU-readable Arrow column. Dictionary encoding is decoded by Arrow's get(). */
export type CellColumn<T> = {readonly length: number; get(index: number): T | null};
/** A numeric or string cell, or a feature containing multiple cells. */
export type CellValue = string | bigint | Iterable<string | bigint>;
/** Columns shared by the DGGS layers. Styling rows correspond to source features. */
export type CellColumnProps = {
  /** Arrow cell identifiers, including list and dictionary-encoded columns. */
  cells?: CellColumn<CellValue> | null;
  /** RGBA fill colors in feature order. */
  fillColors?: CellColumn<Iterable<number>> | null;
  /** RGBA outline colors in feature order. */
  lineColors?: CellColumn<Iterable<number>> | null;
  /** Outline widths in feature order. */
  lineWidths?: CellColumn<number> | null;
  /** Elevations in feature order. */
  elevations?: CellColumn<number> | null;
};

export const cellColumnDefaults: DefaultProps<CellColumnProps> = {
  cells: {type: 'object', value: null, optional: true},
  fillColors: {type: 'object', value: null, optional: true},
  lineColors: {type: 'object', value: null, optional: true},
  lineWidths: {type: 'object', value: null, optional: true},
  elevations: {type: 'object', value: null, optional: true}
};

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
  const props = layer.props as CellColumnProps & Record<string, any>;
  const cells = props.cells!;
  const rows =
    props.data && typeof props.data.get === 'function'
      ? Array.from({length: props.data.numRows}, (_, index) => props.data.get(index))
      : Array.from(createIterable(props.data).iterable);
  if (rows.length && rows.length !== cells.length)
    throw new Error('cells and data lengths must match');
  const styles = {
    fillColors: 'getFillColor',
    lineColors: 'getLineColor',
    lineWidths: 'getLineWidth',
    elevations: 'getElevation'
  } as const;
  for (const name of Object.keys(styles) as (keyof typeof styles)[]) {
    if (props[name] && props[name].length !== cells.length)
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
      cell = BigInt.asUintN(64, cell);
      if (accessor === 'getPentagon') return cell;
      if (accessor === 'getS2Token') return cell.toString(16).padStart(16, '0').replace(/0+$/, '');
      if (accessor === 'getHexagon' || accessor === 'getHexagons') return cell.toString(16);
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
  for (const [name, target] of Object.entries(styles)) {
    const column = props[name as keyof typeof styles];
    styleProps[target] = callbacks.accessor(
      column
        ? (_: unknown, info: {index: number}) => {
            const value = column.get(info.index);
            if (value === null || value === undefined)
              throw new Error('Cell styles cannot contain nulls');
            return typeof value === 'number' ? value : Array.from(value);
          }
        : props[target]
    );
  }
  const CellLayer = layer.constructor as new (props: any) => Layer;
  return new CellLayer({
    ...props,
    ...callbacks.props({
      id: 'columns',
      updateTriggers: Object.fromEntries(
        Object.entries(styles).map(([name, target]) => [
          target,
          [props[name], props.updateTriggers?.[target]]
        ])
      )
    }),
    cells: null,
    fillColors: null,
    lineColors: null,
    lineWidths: null,
    elevations: null,
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
