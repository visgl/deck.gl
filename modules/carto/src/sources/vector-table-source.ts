/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {SourceOptions, SpatialDataType, TableSourceOptions, TypedSource} from './common';

export type VectorTableSourceOptions = SourceOptions & TableSourceOptions;
type UrlParameters = {
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

const vectorTableSource: TypedSource<VectorTableSourceOptions> = async function (
  options: VectorTableSourceOptions
): Promise<any> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName, spatialDataType: 'geo'};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  return baseSource<UrlParameters>('table', options, urlParameters);
};

export {vectorTableSource};
