import {CartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TypedSource} from './common';

export type CartoRasterSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const CartoRasterSource: TypedSource<CartoRasterSourceOptions> = async function (
  options: CartoRasterSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('raster', options, urlParameters);
};

export {CartoRasterSource};
