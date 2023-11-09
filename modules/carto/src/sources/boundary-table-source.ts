import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryTableSourceOptions = SourceOptions & {
  boundaryId: string;
  columns?: string[];
  matchingColumn?: string;
  tableName: string;
};
type UrlParameters = {
  boundaryId: string;
  columns?: string;
  matchingColumn: string;
  tableName: string;
};

export const boundaryTableSource = async function (
  options: BoundaryTableSourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, columns, matchingColumn = 'id', tableName} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingColumn,
    tableName
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
