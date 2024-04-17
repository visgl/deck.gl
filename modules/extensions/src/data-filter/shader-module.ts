import type {ShaderModule} from '@luma.gl/shadertools';
import type {DataFilterExtensionProps} from './data-filter-extension';
import {glsl} from '../utils/syntax-tags';

/*
 * data filter shader module
 */
export type Defines = {
  // Defines passed externally
  /**
   * Primitive type of parameter used for category filtering. If undefined, category filtering disabled.
   */
  DATACATEGORY_TYPE?: 'float' | 'vec2' | 'vec3' | 'vec4';
  /**
   * Number of category filtering channels. Must match dimension of `DATACATEGORY_TYPE`
   */
  DATACATEGORY_CHANNELS?: 1 | 2 | 3 | 4;

  /**
   * Primitive type of parameter used for numeric filtering. If undefined, numeric filtering disabled.
   */
  DATAFILTER_TYPE?: 'float' | 'vec2' | 'vec3' | 'vec4';

  /**
   * Enable 64-bit precision in numeric filter.
   */
  DATAFILTER_DOUBLE?: boolean;

  // Defines derived in shader
  /**
   * Numeric filter attribute
   */
  DATAFILTER_ATTRIB?: 'filterValues' | 'instanceFilterValues';
  /**
   * Numeric filter attribute (low bits). Only used when `DATAFILTER_DOUBLE = true`
   */
  DATAFILTER_ATTRIB_64LOW?: 'filterValues64Low' | 'instanceFilterValues64Low';
  /**
   * Category filter attribute
   */
  DATACATEGORY_ATTRIB?: 'filterCategoryValues' | 'instanceFilterCategoryValues';
};

const vs = glsl`
uniform bool filter_useSoftMargin;
uniform bool filter_enabled;
uniform bool filter_transformSize;
uniform ivec4 filter_categoryBitMask;

#ifdef DATAFILTER_TYPE
  uniform DATAFILTER_TYPE filter_min;
  uniform DATAFILTER_TYPE filter_softMin;
  uniform DATAFILTER_TYPE filter_softMax;
  uniform DATAFILTER_TYPE filter_max;

  #ifdef NON_INSTANCED_MODEL
    #define DATAFILTER_ATTRIB filterValues
    #define DATAFILTER_ATTRIB_64LOW filterValues64Low
  #else
    #define DATAFILTER_ATTRIB instanceFilterValues
    #define DATAFILTER_ATTRIB_64LOW instanceFilterValues64Low
  #endif

  in DATAFILTER_TYPE DATAFILTER_ATTRIB;
  #ifdef DATAFILTER_DOUBLE
    in DATAFILTER_TYPE DATAFILTER_ATTRIB_64LOW;

    uniform DATAFILTER_TYPE filter_min64High;
    uniform DATAFILTER_TYPE filter_max64High;
  #endif
#endif


#ifdef DATACATEGORY_TYPE
  #ifdef NON_INSTANCED_MODEL
    #define DATACATEGORY_ATTRIB filterCategoryValues
  #else
    #define DATACATEGORY_ATTRIB instanceFilterCategoryValues
  #endif
  in DATACATEGORY_TYPE DATACATEGORY_ATTRIB;
#endif

out float dataFilter_value;

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

#ifdef DATAFILTER_ATTRIB
  void dataFilter_setValue(DATAFILTER_TYPE valueFromMin, DATAFILTER_TYPE valueFromMax) {
    if (filter_useSoftMargin) {
      // smoothstep results are undefined if edge0 ≥ edge1
      // Fallback to ignore filterSoftRange if it is truncated by filterRange
      DATAFILTER_TYPE leftInRange = mix(
        step(filter_min, valueFromMin),
        smoothstep(filter_min, filter_softMin, valueFromMin),
        lessThan(filter_min, filter_softMin)
      );
      DATAFILTER_TYPE rightInRange = mix(
        step(valueFromMax, filter_max),
        1.0 - smoothstep(filter_softMax, filter_max, valueFromMax),
        lessThan(filter_softMax, filter_max)
      );
      dataFilter_value = dataFilter_reduceValue(leftInRange * rightInRange);
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(filter_min, valueFromMin) * step(valueFromMax, filter_max)
      );
    }
  }
#endif

#ifdef DATACATEGORY_ATTRIB
  void dataFilter_setCategoryValue(DATACATEGORY_TYPE category) {
    #if DATACATEGORY_CHANNELS == 1 // One 128-bit mask
    int dataFilter_masks = filter_categoryBitMask[int(category / 32.0)];
    #elif DATACATEGORY_CHANNELS == 2 // Two 64-bit masks
    ivec2 dataFilter_masks = ivec2(
      filter_categoryBitMask[int(category.x / 32.0)],
      filter_categoryBitMask[int(category.y / 32.0) + 2]
    );
    #elif DATACATEGORY_CHANNELS == 3 // Three 32-bit masks
    ivec3 dataFilter_masks = filter_categoryBitMask.xyz;
    #else // Four 32-bit masks
    ivec4 dataFilter_masks = filter_categoryBitMask;
    #endif

    // Shift mask and extract relevant bits
    DATACATEGORY_TYPE dataFilter_bits = DATACATEGORY_TYPE(dataFilter_masks) / pow(DATACATEGORY_TYPE(2.0), mod(category, 32.0));
    dataFilter_bits = mod(floor(dataFilter_bits), 2.0);

    #if DATACATEGORY_CHANNELS == 1
    if(dataFilter_bits == 0.0) dataFilter_value = 0.0;
    #else
    if(any(equal(dataFilter_bits, DATACATEGORY_TYPE(0.0)))) dataFilter_value = 0.0;
    #endif
  }
#endif
`;

const fs = glsl`
uniform bool filter_transformColor;
in float dataFilter_value;
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
  'vs:#main-start': glsl`
    dataFilter_value = 1.0;
    if (filter_enabled) {
      #ifdef DATAFILTER_ATTRIB
        #ifdef DATAFILTER_DOUBLE
          dataFilter_setValue(
            DATAFILTER_ATTRIB - filter_min64High + DATAFILTER_ATTRIB_64LOW,
            DATAFILTER_ATTRIB - filter_max64High + DATAFILTER_ATTRIB_64LOW
          );
        #else
          dataFilter_setValue(DATAFILTER_ATTRIB, DATAFILTER_ATTRIB);
        #endif
      #endif

      #ifdef DATACATEGORY_ATTRIB
        dataFilter_setCategoryValue(DATACATEGORY_ATTRIB);
      #endif
    }
  `,

  'vs:#main-end': glsl`
    if (dataFilter_value == 0.0) {
      gl_Position = vec4(0.);
    }
  `,

  'vs:DECKGL_FILTER_SIZE': glsl`
    if (filter_transformSize) {
      size = size * dataFilter_value;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': glsl`
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
