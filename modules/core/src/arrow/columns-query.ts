// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {queryArrowTable, type ArrowQueryOptions} from '@loaders.gl/core/scan/query-arrow-table';
import {compileArrowExpression} from '@math.gl/arrow/expressions';
import type {Expression} from '@math.gl/core/expressions';
import type {TableSelection} from '@math.gl/core/sql';
import {makeVector, Table, type Vector} from 'apache-arrow';
import type {ColumnsQuery, SQLParser} from '../types/layer-props';
import {unwrapArrowTable} from './unwrap-arrow-table';

/** Filters source rows and projects fields or expressions into a new Arrow table. */
export function projectColumns(
  source: unknown,
  query: ColumnsQuery | string,
  parser?: SQLParser
): {table: Table; sourceRowIndices?: {get(index: number): number | null}} {
  const data = unwrapArrowTable(source);
  if (!data) {
    throw new Error('columnsQuery requires Arrow table data');
  }
  const {select, where, limit} = normalizeQuery(data, query, parser);
  let predicate = where;
  if (typeof where === 'string') {
    if (!parser?.parsePredicate) {
      throw new Error('columnsQuery WHERE strings require sqlParser.parsePredicate');
    }
    predicate = parser.parsePredicate(where);
  }
  const options: ArrowQueryOptions = {
    predicate: predicate as ArrowQueryOptions['predicate'],
    limit
  };
  let input = data;
  let sourceRowIndices: {get(index: number): number | null} | undefined;
  if (predicate) {
    const names = data.schema.fields.map(field => field.name);
    let indexName = '__deckSourceRow';
    while (names.includes(indexName)) {
      indexName += '_';
    }
    const indices = Uint32Array.from({length: data.numRows}, (_, index) => index);
    const indexed = data.assign(new Table({[indexName]: makeVector(indices)}));
    const filtered = queryArrowTable({shape: 'arrow-table', data: indexed}, options).data;
    sourceRowIndices = filtered.getChild(indexName)!;
    input = filtered.select(names);
  } else if (limit !== undefined) {
    input = data.slice(0, limit);
  }
  const sourceFields = select.filter(field => typeof field === 'string' || 'column' in field);
  if (sourceFields.length === select.length) {
    const table = queryArrowTable({shape: 'arrow-table', data: input}, {select: sourceFields}).data;
    return {table, sourceRowIndices};
  }

  const outputNames = new Set<string>();
  const computed: Record<string, Vector> = Object.create(null);
  for (const field of select) {
    const name =
      typeof field === 'string' ? field : (field.as ?? ('column' in field ? field.column : ''));
    if (!name || outputNames.has(name)) {
      throw new Error(`Invalid or duplicate columnsQuery output name: ${name}`);
    }
    outputNames.add(name);
    if (typeof field !== 'string' && 'expression' in field) {
      let expression: Expression;
      if (typeof field.expression === 'string') {
        if (!parser?.parseExpression) {
          throw new Error('columnsQuery expression strings require sqlParser.parseExpression');
        }
        expression = parser.parseExpression(field.expression);
      } else {
        expression = field.expression;
      }
      computed[name] = compileArrowExpression(expression, {
        inputSchema: input.schema
      }).evaluateTable(input);
    }
  }
  const computedTable = new Table(computed);
  if (!sourceFields.length) {
    return {table: computedTable.select([...outputNames]), sourceRowIndices};
  }
  const selected = queryArrowTable(
    {shape: 'arrow-table', data: input},
    {select: sourceFields}
  ).data;
  return {table: selected.assign(computedTable).select([...outputNames]), sourceRowIndices};
}

/** Binds a parsed SELECT to the one table already loaded by the layer. */
function normalizeQuery(
  data: Table,
  query: ColumnsQuery | string,
  parser?: SQLParser
): ColumnsQuery {
  if (typeof query !== 'string') {
    return query;
  }
  if (!parser?.parseQuery) {
    throw new Error('columnsQuery SQL strings require sqlParser.parseQuery');
  }
  const parsed = parser.parseQuery(query);
  if ('command' in parsed || ('from' in parsed && parsed.from && parsed.from !== 'data')) {
    throw new Error('columnsQuery requires a SELECT on the loaded data table');
  }
  if (typeof parsed.where === 'object' && 'expression' in parsed.where) {
    throw new Error('columnsQuery WHERE must be a supported column predicate');
  }
  const select =
    parsed.select?.map(normalizeSelection) ?? data.schema.fields.map(field => field.name);
  return {select, where: parsed.where, limit: parsed.limit};
}

/** Converts the parser's compact ARRAY selection into an expression AST. */
function normalizeSelection(
  field: TableSelection | ColumnsQuery['select'][number]
): ColumnsQuery['select'][number] {
  if (typeof field === 'string' || 'column' in field) {
    return field;
  }
  if ('array' in field) {
    return {
      as: field.as,
      expression: {
        type: 'CallExpression',
        sqlFunction: true,
        callee: {type: 'Identifier', name: field.type ? `array_${field.type}` : 'array'},
        arguments: field.array.map(name => ({type: 'Identifier', name}))
      }
    };
  }
  if (!field.as) {
    throw new Error('columnsQuery expressions require an output alias');
  }
  return {as: field.as, expression: field.expression};
}
