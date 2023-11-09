import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  matchingPropertyName?: string;
  propertiesSqlQuery: string;
};
type UrlParameters = {
  boundaryId: string;
  matchingPropertyName: string;
  propertiesQuerySource: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, matchingPropertyName = 'id', propertiesSqlQuery} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingPropertyName,
    propertiesQuerySource: propertiesSqlQuery
  };
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
