import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult,
  CartoTilesetSourceOptions
} from './common';

export type CartoVectorTilesetSourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoTilesetSourceOptions;

type UrlParameters = {
  name: string;
};

export async function CartoVectorTilesetSource(
  options: CartoVectorTilesetSourceOptions
): Promise<CartoTilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return CartoBaseSource<UrlParameters>(MAP_TYPES.TILESET, options, urlParameters);
}
