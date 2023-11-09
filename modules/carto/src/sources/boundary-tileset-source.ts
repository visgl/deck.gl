import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryTilesetSourceOptions = SourceOptions & {boundaryId: string};
type UrlParameters = {boundaryId: string};

export const boundaryTilesetSource = async function (
  options: BoundaryTilesetSourceOptions
): Promise<TilejsonResult> {
  const {boundaryId} = options;
  const urlParameters: UrlParameters = {boundaryId};

  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
