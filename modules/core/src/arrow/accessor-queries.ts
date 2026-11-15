// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Table, type Vector} from 'apache-arrow';
import type {SQLParser} from '../types/layer-props';
import {evaluateColumnExpression} from './column-constructors';
import {isArrowTableAppend} from './column-query-append';
import {unwrapLoaderArrowResult} from '../utils/loader-utils';
import {isArrowTable} from './upstream-math/is-arrow-table';

/** Evaluates row-preserving expressions, reusing prior batches for append-only data. */
export function evaluateAccessorQueries(
  source: unknown,
  expressions: Record<string, string>,
  parseExpression: SQLParser['parseExpression'],
  previous?: {
    source: unknown;
    expressions: Record<string, string>;
    parseExpression: SQLParser['parseExpression'];
    table?: Table;
  }
): Table {
  const data = unwrapLoaderArrowResult(source);
  if (!isArrowTable(data)) {
    throw new Error('SQL accessors require Arrow table data');
  }
  if (!parseExpression) {
    throw new Error('SQL accessors require sqlParser.parseExpression');
  }

  const entries = Object.entries(expressions);
  const priorSource = unwrapLoaderArrowResult(previous?.source);
  const priorTable = previous?.table;
  const canAppend =
    isArrowTable(priorSource) &&
    priorTable &&
    previous.parseExpression === parseExpression &&
    Object.keys(previous.expressions).length === entries.length &&
    entries.every(([name, expression]) => previous.expressions[name] === expression) &&
    isArrowTableAppend(priorSource, data);
  const input = canAppend
    ? new Table(data.schema, data.batches.slice(priorSource.batches.length))
    : data;
  const parsed = entries.map(([name, sql]) => ({name, expression: parseExpression(sql)}));
  const evaluate = (table: Table) => {
    const columns: Record<string, Vector> = Object.create(null);
    for (const {name, expression} of parsed) {
      columns[name] = evaluateColumnExpression(expression, table);
    }
    return new Table(columns);
  };

  const batches = input.batches;
  const result =
    batches.length <= 1
      ? evaluate(input)
      : new Table(batches.flatMap(batch => evaluate(new Table(input.schema, [batch])).batches));
  return canAppend ? new Table(result.schema, [...priorTable.batches, ...result.batches]) : result;
}
