/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTableSourceOptions, SpatialDataType, TypedSource} from './common';

export type CartoVectorTableSourceOptions = CartoSourceOptions & CartoTableSourceOptions;
type UrlParameters = {
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

const cartoVectorTableSource: TypedSource<CartoVectorTableSourceOptions> = async function (
  options: CartoVectorTableSourceOptions
): Promise<any> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName, spatialDataType: 'geometry'};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  return cartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {cartoVectorTableSource};
