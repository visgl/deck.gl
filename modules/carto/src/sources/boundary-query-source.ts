import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  propertiesSqlSource: string;
};
type UrlParameters = {
  boundaryId: string;
  propertiesQuerySource: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, propertiesSqlSource: propertiesQuerySource} = options;
  const urlParameters: UrlParameters = {boundaryId, propertiesQuerySource};
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
