import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTableSourceOptions,
  CartoTilejsonResult,
  GeojsonResult
} from './common';

export type CartoVectorTableSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTableSourceOptions;

type UrlParameters = {
  columns?: string;
  geo_column?: string;
  name: string;
};

export async function CartoVectorTableSource(
  options: CartoVectorTableSourceOptions & {format?: 'tilejson'}
): Promise<CartoTilejsonResult>;
export async function CartoVectorTableSource(
  options: CartoVectorTableSourceOptions & {format: 'geojson'}
): Promise<GeojsonResult>;

export async function CartoVectorTableSource(options: CartoVectorTableSourceOptions): Promise<any> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  return CartoBaseSource<UrlParameters>(MAP_TYPES.TABLE, options, urlParameters);
}
