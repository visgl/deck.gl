import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilesetSourceOptions,
  TilejsonSource
} from './common';

export type CartoQuadbinTilesetSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTilesetSourceOptions;

type UrlParameters = {
  name: string;
};

const CartoQuadbinTilesetSource: TilejsonSource<CartoQuadbinTilesetSourceOptions> = async function (
  options: CartoQuadbinTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {CartoQuadbinTilesetSource};
