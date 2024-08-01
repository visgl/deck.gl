/* eslint-disable camelcase */
import {DEFAULT_AGGREGATION_RES_LEVEL_H3} from '../constants';
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  FilterOptions,
  SourceOptions,
  SpatialDataType,
  TableSourceOptions,
  TilejsonResult
} from './types';

export type H3TableSourceOptions = SourceOptions &
  TableSourceOptions &
  AggregationOptions &
  FilterOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
  filters?: Record<string, unknown>;
};

export const h3TableSource = async function (
  options: H3TableSourceOptions
): Promise<TilejsonResult> {
  const {
    aggregationExp,
    aggregationResLevel = DEFAULT_AGGREGATION_RES_LEVEL_H3,
    spatialDataColumn = 'h3',
    tableName,
    filters
  } = options;
  const urlParameters: UrlParameters = {
    aggregationExp,
    name: tableName,
    spatialDataColumn,
    spatialDataType: 'h3'
  };

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (filters) {
    urlParameters.filters = filters;
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
