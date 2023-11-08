/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {SourceOptions, SpatialDataType, TableSourceOptions, TilejsonResult} from './types';

export type VectorTableSourceOptions = SourceOptions & TableSourceOptions;
type UrlParameters = {
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

export const vectorTableSource = async function (
  options: VectorTableSourceOptions
): Promise<TilejsonResult> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName, spatialDataType: 'geometry'};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
