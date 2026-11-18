// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Field, FixedSizeList, Table, Uint8, vectorFromArray, type Vector} from 'apache-arrow';
import {compileArrowScales, parseSQLScaleAST, type ResolvedScale} from '@math.gl/sql/scales';
import type {SQLFunctions, SQLParser} from '../types/layer-props';
import {evaluateColumnExpression} from './column-constructors';
import {isArrowTableAppend} from './column-query-append';
import {unwrapLoaderArrowResult} from '../utils/loader-utils';
import {isArrowTable} from './upstream-math/is-arrow-table';
import {sqlParser} from './upstream-math/sql-parser';
import {deepEqual} from '../utils/deep-equal';

/** SQL functions that produce SDR color accessor columns. */
const COLOR_SCALE_FUNCTIONS = new Set([
  'SCALE_COLOR',
  'SCALE_DIVERGING',
  'SCALE_ORDINAL',
  'SCALE_QUANTILE',
  'SCALE_QUANTIZE'
]);

/** Evaluates row-preserving expressions and returns their resolved scale metadata. */
export function evaluateAccessorQueries(
  source: unknown,
  expressions: Record<string, string>,
  parseExpression: SQLParser['parseExpression'],
  previous?: {
    source: unknown;
    expressions: Record<string, string>;
    parseExpression: SQLParser['parseExpression'];
    functions?: SQLFunctions;
    table?: Table;
  },
  functions?: SQLFunctions
): {table: Table; scales: Readonly<Record<string, ResolvedScale>>} {
  const data = unwrapLoaderArrowResult(source);
  if (!isArrowTable(data)) {
    throw new Error('SQL accessors require Arrow table data');
  }

  const entries = Object.entries(expressions);
  const parse = parseExpression ?? sqlParser.parseExpression;
  const customFunctions = new Set(functions?.map(fn => fn.name.toUpperCase()));
  const parsed = entries.map(([name, sql]) => {
    const expression = parse(sql);
    const isColorScale =
      expression.type === 'CallExpression' &&
      expression.callee?.type === 'Identifier' &&
      typeof expression.callee.name === 'string' &&
      COLOR_SCALE_FUNCTIONS.has(expression.callee.name.toUpperCase()) &&
      !customFunctions.has(expression.callee.name.toUpperCase());
    return {name, expression, isColorScale};
  });
  const scaleExpressions = parsed
    .filter(({isColorScale}) => isColorScale)
    .map(({name, expression}) => {
      const {value, scale} = parseSQLScaleAST(expression);
      return [name, {value, scale: {...scale, nullColor: [0, 0, 0, 0] as const}}] as const;
    });
  const compiled = compileArrowScales(
    data,
    Object.fromEntries(
      scaleExpressions.filter(
        ([
          ,
          {
            scale: {domain}
          }
        ]) => {
          if (!('column' in domain)) {
            return true;
          }
          const column = data.getChild(domain.column);
          return !column || column.nullCount !== column.length;
        }
      )
    ),
    functions
  );
  const scales = Object.fromEntries(
    Object.entries(compiled).map(([name, {scale}]) => [name, scale])
  );
  const priorSource = unwrapLoaderArrowResult(previous?.source);
  const priorTable = previous?.table;
  const canAppend =
    isArrowTable(priorSource) &&
    priorTable &&
    previous.parseExpression === parseExpression &&
    deepEqual(previous.functions, functions, 1) &&
    Object.keys(previous.expressions).length === entries.length &&
    entries.every(([name, expression]) => previous.expressions[name] === expression) &&
    isArrowTableAppend(priorSource, data);
  const batches = data.batches.length ? data.batches : [undefined];
  const result = batches.flatMap((batch, index) => {
    const previousBatch =
      canAppend && index < priorSource.batches.length ? priorTable.batches[index] : undefined;
    if (previousBatch && !scaleExpressions.length) return [previousBatch];
    const input = batch ? new Table(data.schema, [batch]) : data;
    const columns: Record<string, Vector> = Object.create(null);
    for (const {name, expression, isColorScale} of parsed) {
      // A new domain can change the color of previously evaluated rows.
      columns[name] = isColorScale
        ? (compiled[name]?.evaluate(input) ??
          vectorFromArray(
            Array.from({length: input.numRows}, () => [0, 0, 0, 0]),
            new FixedSizeList(4, new Field('item', new Uint8(), false))
          ))
        : (previousBatch?.getChild(name) ?? evaluateColumnExpression(expression, input, functions));
    }
    return new Table(columns).batches;
  });
  return {table: new Table(result), scales};
}
