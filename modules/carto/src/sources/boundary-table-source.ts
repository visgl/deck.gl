import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryTableSourceOptions = SourceOptions & {
  tilesetTableName: string;
  columns?: string[];
  matchingColumn?: string;
  propertiesTableName: string;
};
type UrlParameters = {
  tilesetTableName: string;
  columns?: string;
  matchingColumn: string;
  propertiesTableName: string;
};

export const boundaryTableSource = async function (
  options: BoundaryTableSourceOptions
): Promise<TilejsonResult> {
  const {tilesetTableName, columns, matchingColumn = 'id', propertiesTableName} = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    matchingColumn,
    propertiesTableName
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
