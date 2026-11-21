// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Field,
  FixedSizeList,
  Float64,
  Table,
  Uint8,
  vectorFromArray,
  type Vector
} from 'apache-arrow';
import {
  compileArrowScale,
  compileArrowScales,
  parseSQLScaleAST,
  type ResolvedScale
} from '@math.gl/sql/scales';
import type {SQLFunctions, SQLParser} from '../types/layer-props';
import {evaluateColumnExpression} from './column-constructors';
import {isArrowTableAppend} from './column-query-append';
import {unwrapLoaderArrowResult} from '../utils/loader-utils';
import {isArrowTable} from './upstream-math/is-arrow-table';
import {sqlParser} from './upstream-math/sql-parser';
import {deepEqual} from '../utils/deep-equal';

/** SQL scale functions exposed by the math.gl parser. */
const SCALE_FUNCTIONS = new Set([
  'SCALE_LINEAR',
  'SCALE_SQRT',
  'SCALE_LOG',
  'SCALE_POWER',
  'SCALE_SYMLOG',
  'SCALE_CYCLIC',
  'SCALE_THRESHOLD',
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
      SCALE_FUNCTIONS.has(expression.callee.name.toUpperCase()) &&
      !customFunctions.has(expression.callee.name.toUpperCase());
    return {name, expression, isColorScale};
  });
  const scaleExpressions = parsed
    .filter(({isColorScale}) => isColorScale)
    .map(({name, expression}) => {
      const {value, scale} = parseSQLScaleAST(expression);
      return [
        name,
        {
          value,
          scale:
            scale.range.type === 'numeric' ? scale : {...scale, nullColor: [0, 0, 0, 0] as const}
        }
      ] as const;
    });
  const parsedScales = new Map(scaleExpressions);
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
          if (domain.type === 'expression-extent') {
            return false;
          }
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
  for (const [name, parsedScale] of scaleExpressions) {
    if (parsedScale.scale.domain.type === 'expression-extent') {
      try {
        compiled[name] = compileArrowScale(data, parsedScale, undefined, functions);
      } catch (error) {
        // The upstream resolver signals an extent with no non-null samples with this error.
        if (
          !(error instanceof Error) ||
          error.message !== 'Empty numeric scale expression domain'
        ) {
          throw error;
        }
      }
    }
  }
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
  /** Evaluates one batch and reuses ordinary accessor columns from unchanged input. */
  const evaluateBatch = (input: Table, index: number) => {
    const previousBatch =
      canAppend && index < priorSource.batches.length ? priorTable.batches[index] : undefined;
    if (previousBatch && !scaleExpressions.length)
      return new Table(priorTable!.schema, [previousBatch]);
    const columns: Record<string, Vector> = Object.create(null);
    for (const {name, expression, isColorScale} of parsed) {
      // A new domain can change the color of previously evaluated rows.
      columns[name] = isColorScale
        ? (compiled[name]?.evaluate(input) ??
          (parsedScales.get(name)?.scale.range.type === 'numeric'
            ? vectorFromArray(new Array(input.numRows).fill(null), new Float64())
            : vectorFromArray(
                Array.from({length: input.numRows}, () => [0, 0, 0, 0]),
                new FixedSizeList(4, new Field('item', new Uint8(), false))
              )))
        : (previousBatch?.getChild(name) ?? evaluateColumnExpression(expression, input, functions));
    }
    return new Table(columns);
  };
  const table =
    data.batches.length <= 1
      ? evaluateBatch(data, 0)
      : new Table(
          data.batches.flatMap(
            (batch, index) => evaluateBatch(new Table(data.schema, [batch]), index).batches
          )
        );
  return {table, scales};
}
