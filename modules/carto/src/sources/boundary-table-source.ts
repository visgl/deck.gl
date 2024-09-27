// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, TilejsonResult} from './types';

export type BoundaryTableSourceOptions = SourceOptions &
  FilterOptions & {
    tilesetTableName: string;
    columns?: string[];
    propertiesTableName: string;
  };
type UrlParameters = {
  filters?: Record<string, unknown>;
  tilesetTableName: string;
  columns?: string;
  propertiesTableName: string;
};

export const boundaryTableSource = async function (
  options: BoundaryTableSourceOptions
): Promise<TilejsonResult> {
  const {filters, tilesetTableName, columns, propertiesTableName} = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    propertiesTableName
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = filters;
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
