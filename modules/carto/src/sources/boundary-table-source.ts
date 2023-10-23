import {baseSource} from './base-source';
import {SourceOptions, TilejsonSource} from './common';

export type BoundaryTableSourceOptions = SourceOptions & {
  boundaryId: string;
  columns?: string[];
  propertiesTableSource: string;
};
type UrlParameters = {
  boundaryId: string;
  columns?: string;
  propertiesTableSource: string;
};

const boundaryTableSource: TilejsonSource<BoundaryTableSourceOptions> = async function (
  options: BoundaryTableSourceOptions
): Promise<any> {
  const {boundaryId, columns, propertiesTableSource} = options;
  const urlParameters: UrlParameters = {boundaryId, propertiesTableSource};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters);
};

export {boundaryTableSource};
