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
layout(std140) uniform dataFilterUniforms {
  bool useSoftMargin;
  bool enabled;
  bool transformSize;
  bool transformColor;
  vec4 min;
  vec4 softMin;
  vec4 softMax;
  vec4 max;
  vec4 min64High;
  vec4 max64High;
  highp uvec4 categoryBitMask;
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

#ifdef DATAFILTER_TYPE
  float dataFilter_getMin(float _) {
    return dataFilter.min.x;
  }
  vec2 dataFilter_getMin(vec2 _) {
    return dataFilter.min.xy;
  }
  vec3 dataFilter_getMin(vec3 _) {
    return dataFilter.min.xyz;
  }
  vec4 dataFilter_getMin(vec4 _) {
    return dataFilter.min;
  }

  float dataFilter_getSoftMin(float _) {
    return dataFilter.softMin.x;
  }
  vec2 dataFilter_getSoftMin(vec2 _) {
    return dataFilter.softMin.xy;
  }
  vec3 dataFilter_getSoftMin(vec3 _) {
    return dataFilter.softMin.xyz;
  }
  vec4 dataFilter_getSoftMin(vec4 _) {
    return dataFilter.softMin;
  }

  float dataFilter_getSoftMax(float _) {
    return dataFilter.softMax.x;
  }
  vec2 dataFilter_getSoftMax(vec2 _) {
    return dataFilter.softMax.xy;
  }
  vec3 dataFilter_getSoftMax(vec3 _) {
    return dataFilter.softMax.xyz;
  }
  vec4 dataFilter_getSoftMax(vec4 _) {
    return dataFilter.softMax;
  }

  float dataFilter_getMax(float _) {
    return dataFilter.max.x;
  }
  vec2 dataFilter_getMax(vec2 _) {
    return dataFilter.max.xy;
  }
  vec3 dataFilter_getMax(vec3 _) {
    return dataFilter.max.xyz;
  }
  vec4 dataFilter_getMax(vec4 _) {
    return dataFilter.max;
  }

  float dataFilter_getMin64High(float _) {
    return dataFilter.min64High.x;
  }
  vec2 dataFilter_getMin64High(vec2 _) {
    return dataFilter.min64High.xy;
  }
  vec3 dataFilter_getMin64High(vec3 _) {
    return dataFilter.min64High.xyz;
  }
  vec4 dataFilter_getMin64High(vec4 _) {
    return dataFilter.min64High;
  }

  float dataFilter_getMax64High(float _) {
    return dataFilter.max64High.x;
  }
  vec2 dataFilter_getMax64High(vec2 _) {
    return dataFilter.max64High.xy;
  }
  vec3 dataFilter_getMax64High(vec3 _) {
    return dataFilter.max64High.xyz;
  }
  vec4 dataFilter_getMax64High(vec4 _) {
    return dataFilter.max64High;
  }
#endif

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
    DATAFILTER_TYPE dataFilter_min = dataFilter_getMin(valueFromMin);
    DATAFILTER_TYPE dataFilter_softMin = dataFilter_getSoftMin(valueFromMin);
    DATAFILTER_TYPE dataFilter_softMax = dataFilter_getSoftMax(valueFromMin);
    DATAFILTER_TYPE dataFilter_max = dataFilter_getMax(valueFromMin);
    if (dataFilter.useSoftMargin) {
      // smoothstep results are undefined if edge0 ≥ edge1
      // Fallback to ignore filterSoftRange if it is truncated by filterRange
      DATAFILTER_TYPE leftInRange = mix(
        smoothstep(dataFilter_min, dataFilter_softMin, valueFromMin),
        step(dataFilter_min, valueFromMin),
        step(dataFilter_softMin, dataFilter_min)
      );
      DATAFILTER_TYPE rightInRange = mix(
        1.0 - smoothstep(dataFilter_softMax, dataFilter_max, valueFromMax),
        step(valueFromMax, dataFilter_max),
        step(dataFilter_max, dataFilter_softMax)
      );
      dataFilter_value = dataFilter_reduceValue(leftInRange * rightInRange);
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(dataFilter_min, valueFromMin) * step(valueFromMax, dataFilter_max)
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
    if (dataFilter_bits == 0u) dataFilter_value = 0.0;
    #else
    if (any(equal(dataFilter_bits, DATACATEGORY_TYPE(0u)))) dataFilter_value = 0.0;
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
  const padRange = (value: number | readonly number[]) => {
    if (Array.isArray(value)) {
      return [value[0] || 0, value[1] || 0, value[2] || 0, value[3] || 0];
    }
    return [value, 0, 0, 0];
  };

  return {
    ...(Number.isFinite(filterRange[0])
      ? {
          min: padRange(filterRange[0]),
          softMin: padRange(filterSoftRange[0]),
          softMax: padRange(filterSoftRange[1]),
          max: padRange(filterRange[1])
        }
      : {
          min: padRange(filterRange.map(r => r[0])),
          softMin: padRange(filterSoftRange.map(r => r[0])),
          softMax: padRange(filterSoftRange.map(r => r[1])),
          max: padRange(filterRange.map(r => r[1]))
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
  const min64High = uniforms.min.map(Math.fround);
  uniforms.min = uniforms.min.map((x, i) => x - min64High[i]);
  uniforms.softMin = uniforms.softMin.map((x, i) => x - min64High[i]);
  uniforms.min64High = min64High;

  const max64High = uniforms.max.map(Math.fround);
  uniforms.max = uniforms.max.map((x, i) => x - max64High[i]);
  uniforms.softMax = uniforms.softMax.map((x, i) => x - max64High[i]);
  uniforms.max64High = max64High;
  return uniforms;
}

const inject = {
  'vs:#main-start': /* glsl */ `
    dataFilter_value = 1.0;
    if (dataFilter.enabled) {
      #ifdef DATAFILTER_TYPE
        #ifdef DATAFILTER_DOUBLE
          dataFilter_setValue(
            filterValues - dataFilter_getMin64High(filterValues) + filterValues64Low,
            filterValues - dataFilter_getMax64High(filterValues) + filterValues64Low
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
  const uniformTypes: Record<string, UniformFormat> = {
    useSoftMargin: 'i32',
    enabled: 'i32',
    transformSize: 'i32',
    transformColor: 'i32',
    min: 'vec4<f32>',
    softMin: 'vec4<f32>',
    softMax: 'vec4<f32>',
    max: 'vec4<f32>',
    min64High: 'vec4<f32>',
    max64High: 'vec4<f32>',
    categoryBitMask: 'vec4<u32>'
  };

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
