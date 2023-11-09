import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryTableSourceOptions = SourceOptions & {
  boundaryId: string;
  columns?: string[];
  matchingPropertyName?: string;
  propertiesTableName: string;
};
type UrlParameters = {
  boundaryId: string;
  columns?: string;
  matchingPropertyName: string;
  propertiesTableSource: string;
};

export const boundaryTableSource = async function (
  options: BoundaryTableSourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, columns, matchingPropertyName = 'id', propertiesTableName} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingPropertyName,
    propertiesTableSource: propertiesTableName
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
