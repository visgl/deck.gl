import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TilejsonSource} from './common';

export type CartoVectorTilesetSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const cartoVectorTilesetSource: TilejsonSource<CartoVectorTilesetSourceOptions> = async function (
  options: CartoVectorTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return cartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {cartoVectorTilesetSource};
