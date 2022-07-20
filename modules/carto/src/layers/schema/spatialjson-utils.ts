import {indexToBigInt} from '../quadbin-utils';

export function spatialjsonToBinary(spatial): any {
  const count = spatial.length;
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

  return {
    scheme: 'h3', // TODO infer
    cells
  };
}
