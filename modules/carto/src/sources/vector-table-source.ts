import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult
} from './common';

export type CartoVectorTableSourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  name: string;
};

export async function CartoVectorTableSource(
  options: CartoSourceRequiredOptions &
    Partial<CartoSourceOptionalOptions> &
    CartoVectorTableSourceOptions
): Promise<CartoTilejsonResult> {
  const {columns, spatialDataColumn, name} = options;
  const urlParameters = {name} as Record<keyof CartoVectorTableSourceOptions, string>;
  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return CartoBaseSource<CartoVectorTableSourceOptions>(MAP_TYPES.TABLE, options, urlParameters);
}
