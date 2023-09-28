import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilesetSourceOptions,
  TilejsonSource
} from './common';

export type CartoH3TilesetSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTilesetSourceOptions;

type UrlParameters = {
  name: string;
};

const CartoH3TilesetSource: TilejsonSource<CartoH3TilesetSourceOptions> = async function (
  options: CartoH3TilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>('tileset', options, urlParameters);
};

export {CartoH3TilesetSource};
