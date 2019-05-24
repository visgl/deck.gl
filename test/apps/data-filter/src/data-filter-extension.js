import {LayerExtension} from '@deck.gl/core';
import {setModuleInjection} from '@luma.gl/shadertools';

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const defaultProps = {
  getFilterValue: 1,
  filterRange: [0, 2]
};

export default class DataFilterExtension extends LayerExtension {
  constructor({filterSize = 1} = {}) {
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }
    super({filterSize});
  }

  getShaders(layer, shaders) {
    const {filterSize} = this.opts;
    const dataType = DATA_TYPE_FROM_SIZE[filterSize];

    shaders.modules.push(getDataFilterShaderModule(filterSize));

    return shaders;
  }

  initializeState(layer) {
    layer.getAttributeManager().addInstanced({
      instanceFilterValue: {size: this.opts.filterSize, accessor: 'getFilterValue'}
    });
  }
}

// Cache generated shader modules
const dataFilterShaderModules = {};
/*
 * data filter shader module
 */
function getDataFilterShaderModule(filterSize) {
  if (dataFilterShaderModules[filterSize]) {
    return dataFilterShaderModules[filterSize];
  }

  const dataType = DATA_TYPE_FROM_SIZE[filterSize];

  const vs = `
  uniform ${dataType} filter_min;
  uniform ${dataType} filter_max;

  attribute ${dataType} instanceFilterValue;

  varying float filter_isVisible;

  void filter_setValue(bool visible) {
    filter_isVisible = float(visible);
  }
  `;

  const fs = `
  varying float filter_isVisible;
  `;

  // filter_setValue(instanceFilterValue);
  const moduleName = `data-filter-${filterSize}`;

  const dataFilterModule = {
    name: moduleName,
    vs,
    fs,
    getUniforms: (opts = {}) => {
      if (!opts.filterRange) {
        return {};
      }
      return filterSize === 1
        ? {
            filter_min: opts.filterRange[0],
            filter_max: opts.filterRange[1]
          }
        : {
            filter_min: opts.filterRange.map(r => r[0]),
            filter_max: opts.filterRange.map(r => r[1])
          };
    }
  };

  setModuleInjection('vs', moduleName, {
    shaderHook: 'DECKGL_VERTEX_END',
    injection: filterSize === 1 ? `
      filter_setValue(value <= filter_max && value >= filter_min);
    ` : `
      filter_setValue(all(lessThanEqual(value, filter_max)) && all(greaterThanEqual(value, filter_min)));
    `
  })

  setModuleInjection('fs', moduleName, {
    shaderHook: 'DECKGL_DISCARD',
    injection: `
    if (filter_isVisible < 0.5) discard;
    `,
  })

  // Save generated shader module
  dataFilterShaderModules[filterSize] = dataFilterModule;
  return dataFilterModule;
}
