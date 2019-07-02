import {createModuleInjection} from '@luma.gl/core';

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
attribute DATAFILTER_TYPE filterValues;
#else
attribute DATAFILTER_TYPE instanceFilterValues;
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
void dataFilter_setValue(DATAFILTER_TYPE value) {
  if (filter_enabled) {
    if (filter_useSoftMargin) {
      dataFilter_value = dataFilter_reduceValue(
        smoothstep(filter_min, filter_softMin, value) *
        (1.0 - smoothstep(filter_softMax, filter_max, value))
      );
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(filter_min, value) * step(value, filter_max)
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

const getUniforms = opts => {
  if (!opts || !opts.extensions) {
    return {};
  }
  const {
    filterRange = [-1, 1],
    filterEnabled = true,
    filterTransformSize = true,
    filterTransformColor = true
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
  uniforms.filter_useSoftMargin = Boolean(opts.filterSoftRange);
  uniforms.filter_transformSize = filterEnabled && filterTransformSize;
  uniforms.filter_transformColor = filterEnabled && filterTransformColor;

  return uniforms;
};

// filter_setValue(instanceFilterValue);
const moduleName = 'data-filter';

createModuleInjection(moduleName, {
  hook: 'vs:#main-start',
  injection: `
#ifdef NON_INSTANCED_MODEL
dataFilter_setValue(filterValues);
#else
dataFilter_setValue(instanceFilterValues);
#endif
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

export default {
  name: moduleName,
  vs,
  fs,
  getUniforms
};
