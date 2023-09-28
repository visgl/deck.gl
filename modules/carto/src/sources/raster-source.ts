import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTableSourceOptions,
  TypedSource
} from './common';

export type CartoRasterSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTableSourceOptions;

type UrlParameters = {
  name: string;
};

const CartoRasterSource: TypedSource<CartoRasterSourceOptions> = async function (
  options: CartoRasterSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('raster', options, urlParameters);
};

export {CartoRasterSource};
