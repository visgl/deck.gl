import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, TilejsonSource} from './common';

export type CartoBoundaryQuerySourceOptions = CartoSourceOptions & {
  boundaryId: string;
  propertiesSqlSource: string;
};
type UrlParameters = {
  boundaryId: string;
  propertiesQuerySource: string;
};

const cartoBoundaryQuerySource: TilejsonSource<CartoBoundaryQuerySourceOptions> = async function (
  options: CartoBoundaryQuerySourceOptions
): Promise<any> {
  const {boundaryId, propertiesSqlSource: propertiesQuerySource} = options;
  const urlParameters: UrlParameters = {boundaryId, propertiesQuerySource};
  return cartoBaseSource<UrlParameters>('boundary', options, urlParameters);
};

export {cartoBoundaryQuerySource};
