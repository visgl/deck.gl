import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult,
  SOURCE_DEFAULTS
} from './common';

export type CartoVectorTableSourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  name: string;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export async function CartoVectorTableSource(
  options: CartoSourceRequiredOptions & CartoVectorTableSourceOptions
): Promise<CartoTilejsonResult> {
  const {columns, spatialDataColumn, name} = options;
  const urlParameters = {name} as Record<keyof CartoVectorTableSourceOptions, string>;
  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return CartoBaseSource<CartoVectorTableSourceOptions>(
    MAP_TYPES.TABLE,
    {...SOURCE_DEFAULTS, ...options},
    urlParameters
  );
}
