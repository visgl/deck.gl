/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, SpatialDataType, TableSourceOptions, TilejsonResult} from './types';

export type VectorTableSourceOptions = SourceOptions & TableSourceOptions & FilterOptions;
type UrlParameters = {
  columns?: string;
  filters?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

export const vectorTableSource = async function (
  options: VectorTableSourceOptions
): Promise<TilejsonResult> {
  const {columns, filters, spatialDataColumn = 'geom', tableName} = options;
  const urlParameters: UrlParameters = {name: tableName, spatialDataColumn, spatialDataType: 'geo'};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = JSON.stringify(filters);
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
