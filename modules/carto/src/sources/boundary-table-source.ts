import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, TilejsonSource} from './common';

export type CartoBoundaryTableSourceOptions = CartoSourceOptions & {
  boundaryId: string;
  columns?: string[];
  propertiesTableSource: string;
};
type UrlParameters = {
  boundaryId: string;
  columns?: string;
  propertiesTableSource: string;
};

const cartoBoundaryTableSource: TilejsonSource<CartoBoundaryTableSourceOptions> = async function (
  options: CartoBoundaryTableSourceOptions
): Promise<any> {
  const {boundaryId, columns, propertiesTableSource} = options;
  const urlParameters: UrlParameters = {boundaryId, propertiesTableSource};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return cartoBaseSource<UrlParameters>('boundary', options, urlParameters);
};

export {cartoBoundaryTableSource};
