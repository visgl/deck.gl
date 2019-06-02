import {LayerExtension} from '@deck.gl/core';
import {createModuleInjection} from '@luma.gl/shadertools';

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const defaultProps = {
  getFilterValue: 0,

  filterEnabled: true,
  filterRange: [-1, 1],
  filterSoftRange: null,
  filterTransformSize: true,
  filterTransformColor: true
};

// Cache generated shader modules
const dataFilterShaderModule = getDataFilterShaderModule();

export default class DataFilterExtension extends LayerExtension {
  constructor({filterSize = 1, softMargin = false} = {}) {
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }

    super({filterSize, softMargin});
  }

  getShaders(layer, shaders) {
    const {filterSize, softMargin} = this.opts;

    shaders.defines = Object.assign({}, shaders.defines, {
      DATAFILTER_TYPE: DATA_TYPE_FROM_SIZE[filterSize]
    });
    if (softMargin) {
      shaders.defines.DATAFILTER_SOFT_MARGIN = '1';
    }
    shaders.modules.push(dataFilterShaderModule);

    return shaders;
  }

  initializeState(layer) {
    layer.getAttributeManager().addInstanced({
      instanceFilterValue: {size: this.opts.filterSize, accessor: 'getFilterValue'}
    });
  }
}

DataFilterExtension.extensionName = 'DataFilterExtension';
DataFilterExtension.defaultProps = defaultProps;

/*
 * data filter shader module
 */
function getDataFilterShaderModule() {
  const vs = `
  uniform DATAFILTER_TYPE filter_min;
  uniform DATAFILTER_TYPE filter_softMin;
  uniform DATAFILTER_TYPE filter_softMax;
  uniform DATAFILTER_TYPE filter_max;
  uniform bool filter_enabled;
  uniform bool filter_transformSize;
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
  uniform bool filter_transformColor;
  varying float dataFilter_value;
  `;

  const getUniforms = opts => {
    if (!opts || !opts.extensions) {
      return {};
    }
    const {
      filterRange = defaultProps.filterRange,
      filterEnabled = defaultProps.filterEnabled,
      filterTransformSize = defaultProps.filterTransformSize,
      filterTransformColor = defaultProps.filterTransformColor
    } = opts;
    const filterSoftRange = opts.filterSoftRange || filterRange;

    const uniforms = Number.isFinite(filterRange[0])
      ? {
          filter_min: filterRange[0],
          filter_softMin: filterSoftRange[0],
          filter_softMax: filterSoftRange[1],
          filter_max: filterRange[1]
        }
      : {
          filter_min: filterRange.map(r => r[0]),
          filter_softMin: filterSoftRange.map(r => r[0]),
          filter_softMax: filterSoftRange.map(r => r[1]),
          filter_max: filterRange.map(r => r[1])
        };
    uniforms.filter_enabled = filterEnabled;
    uniforms.filter_transformSize = filterEnabled && filterTransformSize;
    uniforms.filter_transformColor = filterEnabled && filterTransformColor;

    return uniforms;
  };

  // filter_setValue(instanceFilterValue);
  const moduleName = 'data-filter';

  createModuleInjection(moduleName, {
    hook: 'vs:#main-start',
    injection: `
  if (filter_enabled) {
  #ifdef DATAFILTER_SOFT_MARGIN
    dataFilter_setValue(
      smoothstep(filter_min, filter_softMin, instanceFilterValue) *
      (1.0 - smoothstep(filter_softMax, filter_max, instanceFilterValue))
    );
  #else
    dataFilter_setValue(
      step(filter_min, instanceFilterValue) * step(instanceFilterValue, filter_max)
    );
  #endif
  } else {
    dataFilter_setValue(1.0);
  }
    `
  });

  createModuleInjection(moduleName, {
    hook: 'vs:DECKGL_FILTER_SIZE',
    injection: `
  if (filter_transformSize) {
    size = size * dataFilter_value;
  }
    `
  });

  createModuleInjection(moduleName, {
    hook: 'fs:DECKGL_FILTER_COLOR',
    injection: `
  if (dataFilter_value == 0.0) discard;
  if (filter_transformColor) {
    color.a *= dataFilter_value;
  }
    `
  });

  return {
    name: moduleName,
    vs,
    fs,
    getUniforms
  };
}
