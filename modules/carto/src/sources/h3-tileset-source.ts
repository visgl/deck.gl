import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TilejsonSource} from './common';

export type CartoH3TilesetSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const cartoH3TilesetSource: TilejsonSource<CartoH3TilesetSourceOptions> = async function (
  options: CartoH3TilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return cartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {cartoH3TilesetSource};
