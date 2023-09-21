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
  tableName: string;
};

type UrlParameters = {
  columns?: string;
  spatialDataColumn?: string;
  name: string;
};

export async function CartoVectorTableSource(
  options: CartoSourceRequiredOptions &
    Partial<CartoSourceOptionalOptions> &
    CartoVectorTableSourceOptions
): Promise<CartoTilejsonResult> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  return CartoBaseSource<CartoVectorTableSourceOptions, UrlParameters>(
    MAP_TYPES.TABLE,
    options,
    urlParameters
  );
}
