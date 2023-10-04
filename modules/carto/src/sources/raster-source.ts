import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TypedSource} from './common';

export type CartoRasterSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const cartoRasterSource: TypedSource<CartoRasterSourceOptions> = async function (
  options: CartoRasterSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return cartoBaseSource<UrlParameters>('raster', options, urlParameters);
};

export {cartoRasterSource};
