import {CartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoTilesetSourceOptions, TilejsonSource} from './common';

export type CartoQuadbinTilesetSourceOptions = CartoSourceOptions & CartoTilesetSourceOptions;
type UrlParameters = {name: string};

const CartoQuadbinTilesetSource: TilejsonSource<CartoQuadbinTilesetSourceOptions> = async function (
  options: CartoQuadbinTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {CartoQuadbinTilesetSource};
