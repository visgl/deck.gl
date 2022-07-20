import {h3IsValid} from 'h3-js';

import {indexToBigInt} from '../quadbin-utils';

type SCHEME = 'h3' | 'quadbin';

function inferSpatialIndexType(index: string): SCHEME {
  return h3IsValid(index) ? 'h3' : 'quadbin';
}

export function spatialjsonToBinary(spatial): any {
  const count = spatial.length;

  const scheme = count ? inferSpatialIndexType(spatial[0].id) : undefined;
  const cells = {
    indices: {value: new BigUint64Array(count), size: 1},
    numericProps: {},
    properties: []
  };

  let i = 0;
  for (const {id, properties} of spatial) {
    cells.indices.value[i] = indexToBigInt(id);
    i++;
  }

  return {scheme, cells};
}
