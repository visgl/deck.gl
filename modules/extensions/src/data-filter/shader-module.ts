// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import type {DataFilterExtensionOptions, DataFilterExtensionProps} from './data-filter-extension';
import {UniformFormat} from '@luma.gl/shadertools/dist/types';

/*
 * data filter shader module
 */
export type Defines = {
  // Defines passed externally
  /**
   * Primitive type of parameter used for category filtering. If undefined, category filtering disabled.
   */
  DATACATEGORY_TYPE?: 'uint' | 'uvec2' | 'uvec3' | 'uvec4';
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
};

const uniformBlock = /* glsl */ `\
uniform dataFilterUniforms {
  bool useSoftMargin;
  bool enabled;
  bool transformSize;
  bool transformColor;
#ifdef DATAFILTER_TYPE
  DATAFILTER_TYPE min;
  DATAFILTER_TYPE softMin;
  DATAFILTER_TYPE softMax;
  DATAFILTER_TYPE max;
#ifdef DATAFILTER_DOUBLE
  DATAFILTER_TYPE min64High;
  DATAFILTER_TYPE max64High;
#endif
#endif
#ifdef DATACATEGORY_TYPE
  highp uvec4 categoryBitMask;
#endif
} dataFilter;
`;

const vertex = /* glsl */ `
#ifdef DATAFILTER_TYPE
  in DATAFILTER_TYPE filterValues;
#ifdef DATAFILTER_DOUBLE
  in DATAFILTER_TYPE filterValues64Low;
#endif
#endif

#ifdef DATACATEGORY_TYPE
  in DATACATEGORY_TYPE filterCategoryValues;
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

#ifdef DATAFILTER_TYPE
  void dataFilter_setValue(DATAFILTER_TYPE valueFromMin, DATAFILTER_TYPE valueFromMax) {
    if (dataFilter.useSoftMargin) {
      // smoothstep results are undefined if edge0 ≥ edge1
      // Fallback to ignore filterSoftRange if it is truncated by filterRange
      DATAFILTER_TYPE leftInRange = mix(
        smoothstep(dataFilter.min, dataFilter.softMin, valueFromMin),
        step(dataFilter.min, valueFromMin),
        step(dataFilter.softMin, dataFilter.min)
      );
      DATAFILTER_TYPE rightInRange = mix(
        1.0 - smoothstep(dataFilter.softMax, dataFilter.max, valueFromMax),
        step(valueFromMax, dataFilter.max),
        step(dataFilter.max, dataFilter.softMax)
      );
      dataFilter_value = dataFilter_reduceValue(leftInRange * rightInRange);
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(dataFilter.min, valueFromMin) * step(valueFromMax, dataFilter.max)
      );
    }
  }
#endif

#ifdef DATACATEGORY_TYPE
  void dataFilter_setCategoryValue(DATACATEGORY_TYPE category) {
    #if DATACATEGORY_CHANNELS == 1 // One 128-bit mask
    uint dataFilter_masks = dataFilter.categoryBitMask[category / 32u];
    #elif DATACATEGORY_CHANNELS == 2 // Two 64-bit masks
    uvec2 dataFilter_masks = uvec2(
      dataFilter.categoryBitMask[category.x / 32u],
      dataFilter.categoryBitMask[category.y / 32u + 2u]
    );
    #elif DATACATEGORY_CHANNELS == 3 // Three 32-bit masks
    uvec3 dataFilter_masks = dataFilter.categoryBitMask.xyz;
    #else // Four 32-bit masks
    uvec4 dataFilter_masks = dataFilter.categoryBitMask;
    #endif

    // Shift mask and extract relevant bits
    DATACATEGORY_TYPE dataFilter_bits = DATACATEGORY_TYPE(dataFilter_masks) >> (category & 31u);
    dataFilter_bits &= 1u;

    #if DATACATEGORY_CHANNELS == 1
    if(dataFilter_bits == 0u) dataFilter_value = 0.0;
    #else
    if(any(equal(dataFilter_bits, DATACATEGORY_TYPE(0u)))) dataFilter_value = 0.0;
    #endif
  }
#endif
`;

const vs = `
${uniformBlock}
${vertex}
`;

const fragment = /* glsl */ `
in float dataFilter_value;
`;

const fs = `
${uniformBlock}
${fragment}
`;

export type CategoryBitMask = Uint32Array;
export type DataFilterModuleProps = {
  extensions: any[]; // used to detect if layer props are present
  categoryBitMask?: CategoryBitMask;
} & DataFilterExtensionProps;

/* eslint-disable camelcase */
function getUniforms(opts?: DataFilterModuleProps | {}): Record<string, any> {
  if (!opts || !('extensions' in opts)) {
    return {};
  }
  const {
    filterRange = [-1, 1],
    filterEnabled = true,
    filterTransformSize = true,
    filterTransformColor = true,
    categoryBitMask
  } = opts;
  const filterSoftRange = opts.filterSoftRange || filterRange;

  return {
    ...(Number.isFinite(filterRange[0])
      ? {
          min: filterRange[0],
          softMin: filterSoftRange[0],
          softMax: filterSoftRange[1],
          max: filterRange[1]
        }
      : {
          min: filterRange.map(r => r[0]),
          softMin: filterSoftRange.map(r => r[0]),
          softMax: filterSoftRange.map(r => r[1]),
          max: filterRange.map(r => r[1])
        }),
    enabled: filterEnabled,
    useSoftMargin: Boolean(opts.filterSoftRange),
    transformSize: filterEnabled && filterTransformSize,
    transformColor: filterEnabled && filterTransformColor,
    ...(categoryBitMask && {categoryBitMask})
  };
}

function getUniforms64(opts?: DataFilterModuleProps | {}): Record<string, any> {
  if (!opts || !('extensions' in opts)) {
    return {};
  }
  const uniforms = getUniforms(opts);
  if (Number.isFinite(uniforms.min)) {
    const min64High = Math.fround(uniforms.min);
    uniforms.min -= min64High;
    uniforms.softMin -= min64High;
    uniforms.min64High = min64High;

    const max64High = Math.fround(uniforms.max);
    uniforms.max -= max64High;
    uniforms.softMax -= max64High;
    uniforms.max64High = max64High;
  } else {
    const min64High = uniforms.min.map(Math.fround);
    uniforms.min = uniforms.min.map((x, i) => x - min64High[i]);
    uniforms.softMin = uniforms.softMin.map((x, i) => x - min64High[i]);
    uniforms.min64High = min64High;

    const max64High = uniforms.max.map(Math.fround);
    uniforms.max = uniforms.max.map((x, i) => x - max64High[i]);
    uniforms.softMax = uniforms.softMax.map((x, i) => x - max64High[i]);
    uniforms.max64High = max64High;
  }
  return uniforms;
}

const inject = {
  'vs:#main-start': /* glsl */ `
    dataFilter_value = 1.0;
    if (dataFilter.enabled) {
      #ifdef DATAFILTER_TYPE
        #ifdef DATAFILTER_DOUBLE
          dataFilter_setValue(
            filterValues - dataFilter.min64High + filterValues64Low,
            filterValues - dataFilter.max64High + filterValues64Low
          );
        #else
          dataFilter_setValue(filterValues, filterValues);
        #endif
      #endif

      #ifdef DATACATEGORY_TYPE
        dataFilter_setCategoryValue(filterCategoryValues);
      #endif
    }
  `,

  'vs:#main-end': /* glsl */ `
    if (dataFilter_value == 0.0) {
      gl_Position = vec4(0.);
    }
  `,

  'vs:DECKGL_FILTER_SIZE': /* glsl */ `
    if (dataFilter.transformSize) {
      size = size * dataFilter_value;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (dataFilter_value == 0.0) discard;
    if (dataFilter.transformColor) {
      color.a *= dataFilter_value;
    }
  `
};

type UniformTypesFunc = (opts: DataFilterExtensionOptions) => any;
function uniformTypesFromOptions(opts: DataFilterExtensionOptions): any {
  const {categorySize, filterSize, fp64} = opts;
  const uniformTypes: Record<string, UniformFormat> = {
    useSoftMargin: 'i32',
    enabled: 'i32',
    transformSize: 'i32',
    transformColor: 'i32'
  };

  if (filterSize) {
    const uniformFormat: UniformFormat = filterSize === 1 ? 'f32' : `vec${filterSize}<f32>`;
    uniformTypes.min = uniformFormat;
    uniformTypes.softMin = uniformFormat;
    uniformTypes.softMax = uniformFormat;
    uniformTypes.max = uniformFormat;
    if (fp64) {
      uniformTypes.min64High = uniformFormat;
      uniformTypes.max64High = uniformFormat;
    }
  }

  if (categorySize) {
    uniformTypes.categoryBitMask = 'vec4<i32>';
  }

  return uniformTypes;
}

export const dataFilter: ShaderModule<DataFilterModuleProps> & {
  uniformTypesFromOptions: UniformTypesFunc;
} = {
  name: 'dataFilter',
  vs,
  fs,
  inject,
  getUniforms,
  uniformTypesFromOptions
};

export const dataFilter64: ShaderModule<DataFilterModuleProps> & {
  uniformTypesFromOptions: UniformTypesFunc;
} = {
  name: 'dataFilter',
  vs,
  fs,
  inject,
  getUniforms: getUniforms64,
  uniformTypesFromOptions
};
