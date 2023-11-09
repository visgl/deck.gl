import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  matchingColumn?: string;
  sqlQuery: string;
};
type UrlParameters = {
  boundaryId: string;
  matchingColumn: string;
  propertiesQuerySource: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, matchingColumn = 'id', sqlQuery} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingColumn,
    propertiesQuerySource: sqlQuery
  };
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
