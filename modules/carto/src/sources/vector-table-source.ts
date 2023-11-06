/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {SourceOptions, SpatialDataType, TableSourceOptions, TilejsonSource} from './types';

export type VectorTableSourceOptions = SourceOptions & TableSourceOptions;
type UrlParameters = {columns?: string; geo_column?: string; name: string};

const vectorTableSource: TilejsonSource<VectorTableSourceOptions> = async function (
  options: VectorTableSourceOptions
): Promise<any> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  return baseSource<UrlParameters>('table', options, urlParameters);
};

export {vectorTableSource};
