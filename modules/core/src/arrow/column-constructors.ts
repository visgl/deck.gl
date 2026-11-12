// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {compileArrowExpression} from '@math.gl/arrow/expressions';
import type {Expression} from '@math.gl/core/expressions';
import {
  Field,
  FixedSizeList,
  Float16,
  Float32,
  Float64,
  Uint8,
  Uint16,
  vectorFromArray,
  type DataType,
  type Table,
  type Vector
} from 'apache-arrow';

/**
 * deck.gl-local typed vector constructors. Keep this independent of the SQL parser:
 * these function names can move into math.gl's Arrow expression registry later.
 */
const CONSTRUCTORS: Record<string, {width: number; type: () => DataType; normalized?: number}> = {
  FLOAT32X2: {width: 2, type: () => new Float32()},
  FLOAT32X3: {width: 3, type: () => new Float32()},
  FLOAT32X4: {width: 4, type: () => new Float32()},
  FLOAT64X2: {width: 2, type: () => new Float64()},
  FLOAT64X3: {width: 3, type: () => new Float64()},
  FLOAT64X4: {width: 4, type: () => new Float64()},
  RGBA8: {width: 4, type: () => new Uint8(), normalized: 255},
  RGBA16: {width: 4, type: () => new Uint16(), normalized: 65535},
  RGBA16F: {width: 4, type: () => new Float16()},
  RGBA32F: {width: 4, type: () => new Float32()}
};

type FunctionCall = Expression & {
  type: 'CallExpression';
  callee: {type: 'Identifier'; name: string};
  arguments: Expression[];
};

function constructorFor(expression: Expression) {
  const node = expression as FunctionCall;
  if (node.type !== 'CallExpression' || node.callee?.type !== 'Identifier') return null;
  const definition = CONSTRUCTORS[node.callee.name.toUpperCase()];
  if (!definition) return null;
  if (node.arguments.length !== definition.width) {
    throw new Error(`${node.callee.name} requires exactly ${definition.width} arguments`);
  }
  return definition;
}

/** Evaluate one row-preserving SQL expression, including local typed constructors. */
export function evaluateColumnExpression(expression: Expression, input: Table): Vector {
  const constructor = constructorFor(expression);
  if (!constructor) {
    return compileArrowExpression(expression, {inputSchema: input.schema}).evaluateTable(input);
  }

  const call = expression as FunctionCall;
  const components = call.arguments.map(argument =>
    compileArrowExpression(argument, {inputSchema: input.schema}).evaluateTable(input)
  );
  const rows: (number[] | null)[] = new Array(input.numRows);
  for (let row = 0; row < input.numRows; row++) {
    const values: number[] = [];
    let nullValue = false;
    for (let component = 0; component < components.length; component++) {
      const value = components[component]!.get(row);
      if (value === null || value === undefined) {
        nullValue = true;
        break;
      }
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${call.callee.name} requires finite numeric channels (row ${row})`);
      }
      values.push(
        constructor.normalized === undefined
          ? value
          : Math.round(Math.min(1, Math.max(0, value)) * constructor.normalized)
      );
    }
    // One null channel invalidates the entire vector, rather than producing NaN sentinels.
    rows[row] = nullValue ? null : values;
  }
  return vectorFromArray(rows, new FixedSizeList(constructor.width, new Field('item', constructor.type(), true)));
}
