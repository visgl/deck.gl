// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {QueryParameters} from '../api/index';
import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions &
  FilterOptions & {
    columns?: string[];
    tilesetTableName: string;
    propertiesSqlQuery: string;
    queryParameters?: QueryParameters;
  };
type UrlParameters = {
  columns?: string;
  filters?: Record<string, unknown>;
  tilesetTableName: string;
  propertiesSqlQuery: string;
  queryParameters?: Record<string, unknown> | unknown[];
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {columns, filters, tilesetTableName, propertiesSqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    propertiesSqlQuery
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = filters;
  }
  if (queryParameters) {
    urlParameters.queryParameters = queryParameters;
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
