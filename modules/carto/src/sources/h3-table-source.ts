import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTableSourceOptions,
  CartoTilejsonResult
} from './common';

export type CartoH3TableSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTableSourceOptions &
  CartoAggregationOptions;

type UrlParameters = {
  columns?: string;
  geo_column?: string;
  name: string;
  aggregationExp?: string;
  aggregationResLevel?: string;
};

export async function CartoH3TableSource(
  options: CartoH3TableSourceOptions
): Promise<CartoTilejsonResult> {
  const {
    aggregationExp = '1 AS value',
    aggregationResLevel = 4,
    columns,
    spatialDataColumn = 'h3:h3',
    tableName
  } = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (aggregationExp) {
    urlParameters.aggregationExp = aggregationExp;
  }
  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  return CartoBaseSource<CartoH3TableSourceOptions, UrlParameters>(
    MAP_TYPES.TABLE,
    options,
    urlParameters
  );
}
