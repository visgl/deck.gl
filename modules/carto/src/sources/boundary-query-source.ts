import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  matchingColumn?: string;
  queryName: string;
};
type UrlParameters = {
  boundaryId: string;
  matchingColumn: string;
  propertiesQuerySource: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, matchingColumn = 'id', queryName} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingColumn,
    propertiesQuerySource: queryName
  };
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
