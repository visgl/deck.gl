import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryTilesetSourceOptions = SourceOptions & {
  boundaryId: string;
  columns?: string[];
};
type UrlParameters = {
  boundaryId: string;
  columns?: string;
};

export const boundaryTilesetSource = async function (
  options: BoundaryTilesetSourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, columns} = options;
  const urlParameters: UrlParameters = {boundaryId};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
