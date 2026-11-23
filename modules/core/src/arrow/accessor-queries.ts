// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Field,
  FixedSizeList,
  Float64,
  Schema,
  Table,
  Uint8,
  vectorFromArray,
  type RecordBatch,
  type Vector
} from 'apache-arrow';
import {compileArrowScale, compileArrowScales} from '@math.gl/sql/scales';
import {parseSQLScaleAST} from '@math.gl/sql/parser';
import type {ResolvedScale} from '@math.gl/core/color';
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
  const inputData = unwrapLoaderArrowResult(source);
  if (!isArrowTable(inputData)) {
    throw new Error('SQL accessors require Arrow table data');
  }

  const data = Array.isArray(inputData.batches)
    ? inputData
    : new Table(inputData.schema, [inputData as unknown as RecordBatch]);

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
    Array.isArray(priorSource.batches) &&
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
    const fields: Field[] = [];
    for (const {name, expression, isColorScale} of parsed) {
      if (!isColorScale) {
        const reused = previousBatch?.getChild(name);
        const result = reused
          ? {
              column: reused,
              metadata: priorTable?.schema.fields.find(field => field.name === name)?.metadata
            }
          : evaluateColumnExpression(expression, input, functions);
        columns[name] = result.column;
        fields.push(new Field(name, result.column.type, true, result.metadata));
        continue;
      }
      // A new domain can change the color of previously evaluated rows.
      columns[name] =
        compiled[name]?.evaluate(input) ??
        (parsedScales.get(name)?.scale.range.type === 'numeric'
          ? vectorFromArray(new Array(input.numRows).fill(null), new Float64())
          : vectorFromArray(
              Array.from({length: input.numRows}, () => [0, 0, 0, 0]),
              new FixedSizeList(4, new Field('item', new Uint8(), false))
            ));
      fields.push(new Field(name, columns[name].type, true));
    }
    return new Table(new Schema(fields), columns);
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
