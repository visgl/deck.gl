import {_ShaderModule as ShaderModule} from '@deck.gl/core';

import type {DataFilterExtensionProps} from './data-filter-extension';

/*
 * data filter shader module
 */
const vs = `
uniform DATAFILTER_TYPE filter_min;
uniform DATAFILTER_TYPE filter_softMin;
uniform DATAFILTER_TYPE filter_softMax;
uniform DATAFILTER_TYPE filter_max;
uniform bool filter_useSoftMargin;
uniform bool filter_enabled;
uniform bool filter_transformSize;

#ifdef NON_INSTANCED_MODEL
  #define DATAFILTER_ATTRIB filterValues
  #define DATAFILTER_ATTRIB_64LOW filterValues64Low
#else
  #define DATAFILTER_ATTRIB instanceFilterValues
  #define DATAFILTER_ATTRIB_64LOW instanceFilterValues64Low
#endif

attribute DATAFILTER_TYPE DATAFILTER_ATTRIB;
#ifdef DATAFILTER_DOUBLE
  attribute DATAFILTER_TYPE DATAFILTER_ATTRIB_64LOW;

  uniform DATAFILTER_TYPE filter_min64High;
  uniform DATAFILTER_TYPE filter_max64High;
#endif

varying float dataFilter_value;

float dataFilter_reduceValue(float value) {
  return value;
}
float dataFilter_reduceValue(vec2 value) {
  return min(value.x, value.y);
}
float dataFilter_reduceValue(vec3 value) {
  return min(min(value.x, value.y), value.z);
}
float dataFilter_reduceValue(vec4 value) {
  return min(min(value.x, value.y), min(value.z, value.w));
}
void dataFilter_setValue(DATAFILTER_TYPE valueFromMin, DATAFILTER_TYPE valueFromMax) {
  if (filter_enabled) {
    if (filter_useSoftMargin) {
      dataFilter_value = dataFilter_reduceValue(
        smoothstep(filter_min, filter_softMin, valueFromMin) *
        (1.0 - smoothstep(filter_softMax, filter_max, valueFromMax))
      );
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(filter_min, valueFromMin) * step(valueFromMax, filter_max)
      );
    }
  } else {
    dataFilter_value = 1.0;
  }
}
`;

const fs = `
uniform bool filter_transformColor;
varying float dataFilter_value;
`;

type DataFilterModuleSettings = {
  extensions: any[]; // used to detect if layer props are present
} & DataFilterExtensionProps;

/* eslint-disable camelcase */
function getUniforms(opts?: DataFilterModuleSettings | {}): Record<string, any> {
  if (!opts || !('extensions' in opts)) {
    return {};
  }
  const {
    filterRange = [-1, 1],
    filterEnabled = true,
    filterTransformSize = true,
    filterTransformColor = true
  } = opts;
  const filterSoftRange = opts.filterSoftRange || filterRange;

  return {
    ...(Number.isFinite(filterRange[0])
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
        }),
    filter_enabled: filterEnabled,
    filter_useSoftMargin: Boolean(opts.filterSoftRange),
    filter_transformSize: filterEnabled && filterTransformSize,
    filter_transformColor: filterEnabled && filterTransformColor
  };
}

function getUniforms64(opts?: DataFilterModuleSettings | {}): Record<string, any> {
  if (!opts || !('extensions' in opts)) {
    return {};
  }
  const uniforms = getUniforms(opts);
  if (Number.isFinite(uniforms.filter_min)) {
    const min64High = Math.fround(uniforms.filter_min);
    uniforms.filter_min -= min64High;
    uniforms.filter_softMin -= min64High;
    uniforms.filter_min64High = min64High;

    const max64High = Math.fround(uniforms.filter_max);
    uniforms.filter_max -= max64High;
    uniforms.filter_softMax -= max64High;
    uniforms.filter_max64High = max64High;
  } else {
    const min64High = uniforms.filter_min.map(Math.fround);
    uniforms.filter_min = uniforms.filter_min.map((x, i) => x - min64High[i]);
    uniforms.filter_softMin = uniforms.filter_softMin.map((x, i) => x - min64High[i]);
    uniforms.filter_min64High = min64High;

    const max64High = uniforms.filter_max.map(Math.fround);
    uniforms.filter_max = uniforms.filter_max.map((x, i) => x - max64High[i]);
    uniforms.filter_softMax = uniforms.filter_softMax.map((x, i) => x - max64High[i]);
    uniforms.filter_max64High = max64High;
  }
  return uniforms;
}

const inject = {
  'vs:#main-start': `
    #ifdef DATAFILTER_DOUBLE
      dataFilter_setValue(
        DATAFILTER_ATTRIB - filter_min64High + DATAFILTER_ATTRIB_64LOW,
        DATAFILTER_ATTRIB - filter_max64High + DATAFILTER_ATTRIB_64LOW
      );
    #else
      dataFilter_setValue(DATAFILTER_ATTRIB, DATAFILTER_ATTRIB);
    #endif
  `,

  'vs:#main-end': `
    if (dataFilter_value == 0.0) {
      gl_Position = vec4(0.);
    }
  `,

  'vs:DECKGL_FILTER_SIZE': `
    if (filter_transformSize) {
      size = size * dataFilter_value;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': `
    if (dataFilter_value == 0.0) discard;
    if (filter_transformColor) {
      color.a *= dataFilter_value;
    }
  `
};

export const shaderModule: ShaderModule<DataFilterModuleSettings> = {
  name: 'data-filter',
  vs,
  fs,
  inject,
  getUniforms
};

export const shaderModule64: ShaderModule<DataFilterModuleSettings> = {
  name: 'data-filter-fp64',
  vs,
  fs,
  inject,
  getUniforms: getUniforms64
};
