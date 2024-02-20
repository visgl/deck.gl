import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, TilejsonResult} from './types';

export type BoundaryTableSourceOptions = SourceOptions &
  FilterOptions & {
    tilesetTableName: string;
    columns?: string[];
    matchingColumn?: string;
    propertiesTableName: string;
  };
type UrlParameters = {
  filters?: string;
  tilesetTableName: string;
  columns?: string;
  matchingColumn: string;
  propertiesTableName: string;
};

export const boundaryTableSource = async function (
  options: BoundaryTableSourceOptions
): Promise<TilejsonResult> {
  const {filters, tilesetTableName, columns, matchingColumn = 'id', propertiesTableName} = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    matchingColumn,
    propertiesTableName
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = JSON.stringify(filters);
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
