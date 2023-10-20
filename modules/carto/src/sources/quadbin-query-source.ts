/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {AggregationOptions, QuerySourceOptions, SourceOptions, TilejsonSource} from './common';

export type QuadbinQuerySourceOptions = SourceOptions & QuerySourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  geo_column?: string;
  q: string;
  queryParameters?: string;
};

const quadbinQuerySource: TilejsonSource<QuadbinQuerySourceOptions> = async function (
  options: QuadbinQuerySourceOptions
): Promise<any> {
  const {
    aggregationExp,
    aggregationResLevel = 6,
    sqlQuery,
    spatialDataColumn = 'quadbin:quadbin',
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, q: sqlQuery};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters);
};

export {quadbinQuerySource};
