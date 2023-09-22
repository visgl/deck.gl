import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult
} from './common';

export type CartoVectorTilesetSourceOptions = {
  tableName: string;
};

type UrlParameters = {
  name: string;
};

export async function CartoVectorTilesetSource(
  options: CartoSourceRequiredOptions &
    Partial<CartoSourceOptionalOptions> &
    CartoVectorTilesetSourceOptions
): Promise<CartoTilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<CartoVectorTilesetSourceOptions, UrlParameters>(
    MAP_TYPES.TILESET,
    options,
    urlParameters
  );
}
