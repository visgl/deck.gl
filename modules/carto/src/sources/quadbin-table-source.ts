/* eslint-disable camelcase */
import {DEFAULT_AGGREGATION_RES_LEVEL_QUADBIN} from '../constants';
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  SourceOptions,
  SpatialDataType,
  TableSourceOptions,
  TilejsonResult
} from './types';

export type QuadbinTableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

export const quadbinTableSource = async function (
  options: QuadbinTableSourceOptions
): Promise<TilejsonResult> {
  const {
    aggregationExp,
    aggregationResLevel = DEFAULT_AGGREGATION_RES_LEVEL_QUADBIN,
    spatialDataColumn = 'quadbin',
    tableName
  } = options;

  const urlParameters: UrlParameters = {
    aggregationExp,
    name: tableName,
    spatialDataColumn,
    spatialDataType: 'quadbin'
  };

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
