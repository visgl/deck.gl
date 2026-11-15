// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {query, type Query, type QueryOptions} from '@loaders.gl/core/scan';
import {unwrapLoaderArrowResult} from '../utils/loader-utils';
import {isArrowTable} from './upstream-math/is-arrow-table';
import {sqlParser as defaultSQLParser} from './upstream-math/sql-parser';
import type {Loader} from '@loaders.gl/core/loader-utils';
import type {SQLParser} from '../types/layer-props';

/** Executes SQL on URL or in-memory Arrow data through loaders.gl. */
export async function queryLayerData(
  input: unknown,
  sql: string,
  loaders: Loader[] | undefined,
  options: unknown,
  parseQuery: SQLParser['parseQuery']
) {
  const parse = parseQuery ?? defaultSQLParser.parseQuery;
  const sqlParser = (statement: string) => {
    const parsed = parse(statement) as Query;
    return !('command' in parsed) && parsed.from === 'data' ? {...parsed, from: undefined} : parsed;
  };
  if (typeof input === 'string') {
    if (!loaders?.length) {
      throw new Error('query requires a source-capable loader');
    }
    return (await query(sql, {...(options as QueryOptions), source: input, loaders, sqlParser}))
      .data;
  }
  const data = unwrapLoaderArrowResult(input);
  if (!isArrowTable(data)) {
    throw new Error('query requires a URL or Arrow table data');
  }
  const source = {shape: 'arrow-table' as const, data};
  return (await query(sql, {source, sqlParser})).data;
}
