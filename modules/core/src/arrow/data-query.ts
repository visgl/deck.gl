// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {query, type Query, type QueryOptions} from '@loaders.gl/core/scan';
import {unwrapLoaderArrowResult} from '../utils/loader-utils';
import {isArrowTable} from './upstream-math/is-arrow-table';
import {sqlParser as defaultSQLParser} from './upstream-math/sql-parser';
import type {Loader} from '@loaders.gl/core/loader-utils';
import type {SQLParameterSnapshot} from '@math.gl/sql/parser';
import type {SQLParser} from '../types/layer-props';

/** Executes SQL on URL or in-memory Arrow data through loaders.gl. */
export async function queryLayerData(
  input: unknown,
  sql: string,
  loaders: Loader[] | undefined,
  options: unknown,
  parseQuery: SQLParser['parseQuery'],
  parameters?: SQLParameterSnapshot
) {
  const parse = parseQuery ?? defaultSQLParser.parseQuery;
  const sqlParser = (statement: string) => {
    const parsed = parse(statement, {parameters}) as Query;
    return !('command' in parsed) && parsed.from === 'data' ? {...parsed, from: undefined} : parsed;
  };
  if (typeof input === 'string') {
    if (!loaders?.length) {
      throw new Error('query requires a source-capable loader');
    }
    return query(sql, {...(options as QueryOptions), source: input, loaders, sqlParser});
  }
  if (input == null || (Array.isArray(input) && input.length === 0)) {
    return input ?? [];
  }
  const data = unwrapLoaderArrowResult(input);
  if (!isArrowTable(data)) {
    throw new Error('query requires a URL or Arrow table data');
  }
  let scanQuery: Query;
  try {
    scanQuery = sqlParser(sql);
  } catch (error) {
    // Custom parsers own their grammar and diagnostics.
    if (parse !== defaultSQLParser.parseQuery) throw error;
    const {queryArrowSQL} = await import('@math.gl/sql');
    return queryArrowSQL(sql, new Map([['data', data]]), {parameters});
  }
  return query(scanQuery, {source: data});
}
