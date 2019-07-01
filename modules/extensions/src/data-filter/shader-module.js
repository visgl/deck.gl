import {createModuleInjection} from '@luma.gl/core';

/*
 * data filter shader module
 */
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

export default {
  name: moduleName,
  vs,
  fs,
  getUniforms
};
