import {baseSource} from './base-source';
import {SourceOptions, TilejsonSource} from './common';

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
