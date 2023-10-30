import {baseSource} from './base-source';
import type {SourceOptions, TilejsonSource} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  propertiesSqlSource: string;
};
type UrlParameters = {
  boundaryId: string;
  propertiesQuerySource: string;
};

const boundaryQuerySource: TilejsonSource<BoundaryQuerySourceOptions> = async function (
  options: BoundaryQuerySourceOptions
): Promise<any> {
  const {boundaryId, propertiesSqlSource: propertiesQuerySource} = options;
  const urlParameters: UrlParameters = {boundaryId, propertiesQuerySource};
  return baseSource<UrlParameters>('boundary', options, urlParameters);
};

export {boundaryQuerySource};
