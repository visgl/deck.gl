import {LayerExtension} from '@deck.gl/core';

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

export default class DataFilterExtension extends LayerExtension {
  constructor({filterSize = 1} = {}) {
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }
    super({filterSize});
  }

  get name() {
    return 'DataFilter';
  }

  getDefaultProps() {
    return {
      getFilterValue: 1,
      filterRange: [0, 2]
    };
  }

  getShaders() {
    const {filterSize} = this.opts;
    const dataType = DATA_TYPE_FROM_SIZE[filterSize];

    return {
      modules: [getDataFilterShaderModule(filterSize)],
      inject: {
        'vs:#decl': `
  attribute ${dataType} instanceFilterValue;
  `,
        'vs:#main-end': `
  filter_setValue(instanceFilterValue);
  `,
        'fs:#main-end': `
  gl_FragColor = filter_filterColor(gl_FragColor);
  `
      }
    };
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
  varying float filter_isVisible;

  void filter_setValue(bool visible) {
    filter_isVisible = float(visible);
  }

  void filter_setValue(${dataType} value) {
    filter_setValue(${
      filterSize === 1
        ? 'value <= filter_max && value >= filter_min'
        : 'all(lessThanEqual(value, filter_max)) && all(greaterThanEqual(value, filter_min))'
    });
  }
  `;

  const fs = `
  varying float filter_isVisible;
  vec4 filter_filterColor(vec4 color) {
    if (filter_isVisible < 0.5) {
      discard;
    }
    return color;
  }
  `;

  const dataFilterModule = {
    name: `data-filter-${filterSize}`,
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

  // Save generated shader module
  dataFilterShaderModules[filterSize] = dataFilterModule;
  return dataFilterModule;
}
