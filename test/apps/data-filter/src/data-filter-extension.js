import {LayerExtension} from '@deck.gl/core';
import {setModuleInjection} from '@luma.gl/shadertools';

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const defaultProps = {
  getFilterValue: 0,
  filterRange: [-1, 1]
};

// Cache generated shader modules
const dataFilterShaderModule = getDataFilterShaderModule();

export default class DataFilterExtension extends LayerExtension {
  constructor({filterSize = 1, margin = 0} = {}) {
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }
    super({filterSize, margin});
  }

  getShaders(layer, shaders) {
    const {filterSize, margin} = this.opts;

    shaders.defines = Object.assign({}, shaders.defines, {
      DATAFILTER_MARGIN: margin % 1 ? margin.toString() : margin.toFixed(1),
      DATAFILTER_SIZE: filterSize,
      DATAFILTER_TYPE: DATA_TYPE_FROM_SIZE[filterSize]
    });
    shaders.modules.push(dataFilterShaderModule);

    return shaders;
  }

  initializeState(layer) {
    layer.getAttributeManager().addInstanced({
      instanceFilterValue: {size: this.opts.filterSize, accessor: 'getFilterValue'}
    });
  }
}

/*
 * data filter shader module
 */
function getDataFilterShaderModule() {
  const vs = `
  uniform DATAFILTER_TYPE filter_min;
  uniform DATAFILTER_TYPE filter_max;
  attribute DATAFILTER_TYPE instanceFilterValue;
  varying float dataFilter_value;

  void dataFilter_setValue(float value) {
    dataFilter_value = value;
  }
  void dataFilter_setValue(vec2 value) {
    dataFilter_value = min(value.x, value.y);
  }
  void dataFilter_setValue(vec3 value) {
    dataFilter_value = min(min(value.x, value.y), value.z);
  }
  void dataFilter_setValue(vec4 value) {
    dataFilter_value = min(min(value.x, value.y), min(value.z, value.w));
  }
  `;

  const fs = `
  varying float dataFilter_value;
  `;

  const getUniforms = opts => {
    if (!opts || !opts.extensions) {
      return {};
    }
    const {filterRange = defaultProps.filterRange} = opts;

    return Number.isFinite(filterRange[0])
      ? {
          filter_min: filterRange[0],
          filter_max: filterRange[1]
        }
      : {
          filter_min: filterRange.map(r => r[0]),
          filter_max: filterRange.map(r => r[1])
        };
  };

  // filter_setValue(instanceFilterValue);
  const moduleName = 'data-filter';

  setModuleInjection(moduleName, {
    shaderStage: 'vs',
    shaderHook: 'DECKGL_MAIN_START',
    injection: `
    dataFilter_setValue(
      smoothstep(filter_min, filter_min + DATAFILTER_MARGIN, instanceFilterValue) *
      (1.0 - smoothstep(filter_max - DATAFILTER_MARGIN, filter_max, instanceFilterValue))
    );
    `
  });

  setModuleInjection(moduleName, {
    shaderStage: 'vs',
    shaderHook: 'DECKGL_FILTER_SIZE',
    injection: `
    size = size * dataFilter_value;
    `
  });

  setModuleInjection(moduleName, {
    shaderStage: 'fs',
    shaderHook: 'DECKGL_FILTER_COLOR',
    injection: `
    if (dataFilter_value == 0.0) discard;
    color.a *= dataFilter_value;
    `
  });

  return {
    name: moduleName,
    vs,
    fs,
    getUniforms
  };
}
