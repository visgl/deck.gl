import {CartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TilejsonSource} from './common';

export type CartoVectorTilesetSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const CartoVectorTilesetSource: TilejsonSource<CartoVectorTilesetSourceOptions> = async function (
  options: CartoVectorTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {CartoVectorTilesetSource};
