import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult,
  CartoTilesetSourceOptions
} from './common';

export type CartoQuadbinTilesetSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTilesetSourceOptions;

type UrlParameters = {
  name: string;
};

export async function CartoQuadbinTilesetSource(
  options: CartoQuadbinTilesetSourceOptions
): Promise<CartoTilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>(MAP_TYPES.TILESET, options, urlParameters);
}
