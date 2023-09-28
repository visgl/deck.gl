/* eslint-disable camelcase */
import {CartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTableSourceOptions, TypedSource} from './common';

export type CartoVectorTableSourceOptions = CartoSourceOptions & CartoTableSourceOptions;
type UrlParameters = {columns?: string; geo_column?: string; name: string};

const CartoVectorTableSource: TypedSource<CartoVectorTableSourceOptions> = async function (
  options: CartoVectorTableSourceOptions
): Promise<any> {
  const {columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  return CartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {CartoVectorTableSource};
