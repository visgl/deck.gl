/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {SourceOptions, SpatialDataType, TableSourceOptions, TilejsonResult} from './types';

export type VectorTableSourceOptions = SourceOptions & TableSourceOptions;
type UrlParameters = {
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  tileResolution?: string;
  name: string;
};

export const vectorTableSource = async function (
  options: VectorTableSourceOptions
): Promise<TilejsonResult> {
  const {columns, spatialDataColumn = 'geom', tableName, tileResolution = 1} = options;
  const urlParameters: UrlParameters = {
    name: tableName,
    spatialDataColumn,
    spatialDataType: 'geo',
    tileResolution: tileResolution.toString()
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
