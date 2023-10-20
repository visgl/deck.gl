import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TilejsonSource} from './common';

export type CartoQuadbinTilesetSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const cartoQuadbinTilesetSource: TilejsonSource<CartoQuadbinTilesetSourceOptions> = async function (
  options: CartoQuadbinTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return cartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {cartoQuadbinTilesetSource};
