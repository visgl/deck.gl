// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createTexture, destroyTexture} from '../utils/texture';
import {deepEqual} from '../utils/deep-equal';

import type Component from './component';
import type {Color, TextureSource} from '../types/layer-props';
import type Layer from '../lib/layer';
import type {SamplerProps} from '@luma.gl/core';

type BasePropType<ValueT> = {
  value: ValueT;
  async?: boolean;
  validate?: (value: any, propType: PropType) => boolean;
  equal?: (value1: ValueT, value2: ValueT, propType: PropType) => boolean;
};

/**
 * Normalized prop type definition
 */
export type PropType = BasePropType<any> & {
  type: string;
  name: string;
  transform?: (value: any, propType: PropType, component: Component<any>) => any;
  release?: (value: any, propType: PropType, component: Component<any>) => void;
};

type DefaultProp<T> =
  | T
  | DeprecatedProp
  | BooleanPropType
  | NumberPropType
  | ColorPropType
  | ImagePropType
  | DataPropType<T>
  | ArrayPropType<T>
  | ObjectPropType<T>
  | AccessorPropType<T>
  | FunctionPropType<T>;

export type DefaultProps<PropsT extends {} = {}> = {
  [propName in keyof PropsT]?: DefaultProp<Required<PropsT>[propName]>;
};

type BooleanPropType = BasePropType<boolean> & {
  type: 'boolean';
};
type NumberPropType = BasePropType<number> & {
  type: 'number';
  min?: number;
  max?: number;
};
type ColorPropType = BasePropType<Color | null> & {
  type: 'color';
  optional?: boolean;
};
type ArrayPropType<T = any[]> = BasePropType<T> & {
  type: 'array';
  optional?: boolean;
  /** Ignore change in the prop value.
   * @default false
   */
  ignore?: boolean;
  /** Deep-compare two prop values. Only used if `ignore: false`.
   * When a number is supplied, used as the depth of deep-comparison. 0 is equivalent to shallow comparison, -1 is infinite depth
   * When a boolean is supplied, `true` is equivalent to `1` (shallow compare all child fields)
   * @default false
   */
  compare?: boolean | number;
};
type AccessorPropType<T = any> = BasePropType<T> & {
  type: 'accessor';
};
type FunctionPropType<T = Function> = BasePropType<T> & {
  type: 'function';
  optional?: boolean;
  /** @deprecated use `ignore` instead */
  compare?: boolean;
  /** Ignore change in the prop value.
   * @default true
   */
  ignore?: boolean;
};
type DataPropType<T = any> = BasePropType<T> & {
  type: 'data';
};
type ImagePropType = BasePropType<TextureSource | null> & {
  type: 'image';
  parameters?: SamplerProps;
};
type ObjectPropType<T = any> = BasePropType<T> & {
  type: 'object';
  optional?: boolean;
  /** Ignore change in the prop value.
   * @default false
   */
  ignore?: boolean;
  /** Deep-compare two prop values. Only used if `ignore: false`.
   * When a number is supplied, used as the depth of deep-comparison. 0 is equivalent to shallow comparison, -1 is infinite depth
   * When a boolean is supplied, `true` is equivalent to `1` (shallow compare all child fields)
   * @default false
   */
  compare?: boolean | number;
};
type DeprecatedProp = {
  deprecatedFor?: string | string[];
};
type PropTypeDef =
  | DeprecatedProp
  | boolean
  | BooleanPropType
  | number
  | NumberPropType
  | string
  | DataPropType
  | number[]
  | ColorPropType
  | ArrayPropType
  | AccessorPropType
  | FunctionPropType
  | ImagePropType
  | ObjectPropType
  | null;

const TYPE_DEFINITIONS = {
  boolean: {
    validate(value, propType: BooleanPropType) {
      return true;
    },
    equal(value1, value2, propType: BooleanPropType) {
      return Boolean(value1) === Boolean(value2);
    }
  },
  number: {
    validate(value, propType: NumberPropType) {
      return (
        Number.isFinite(value) &&
        (!('max' in propType) || value <= propType.max!) &&
        (!('min' in propType) || value >= propType.min!)
      );
    }
  },
  color: {
    validate(value, propType: ColorPropType) {
      return (
        (propType.optional && !value) ||
        (isArray(value) && (value.length === 3 || value.length === 4))
      );
    },
    equal(value1, value2, propType: ColorPropType) {
      return deepEqual(value1, value2, 1);
    }
  },
  accessor: {
    validate(value, propType: AccessorPropType) {
      const valueType = getTypeOf(value);
      return valueType === 'function' || valueType === getTypeOf(propType.value);
    },
    equal(value1, value2, propType: AccessorPropType) {
      if (typeof value2 === 'function') {
        return true;
      }
      return deepEqual(value1, value2, 1);
    }
  },
  array: {
    validate(value, propType: ArrayPropType) {
      return (propType.optional && !value) || isArray(value);
    },
    equal(value1, value2, propType: ArrayPropType) {
      const {compare} = propType;
      const depth = Number.isInteger(compare as unknown) ? (compare as number) : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  object: {
    equal(value1, value2, propType: ObjectPropType) {
      if (propType.ignore) {
        return true;
      }
      const {compare} = propType;
      const depth = Number.isInteger(compare as unknown) ? (compare as number) : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  function: {
    validate(value, propType: FunctionPropType) {
      return (propType.optional && !value) || typeof value === 'function';
    },
    equal(value1, value2, propType: FunctionPropType) {
      // Backward compatibility - {compare: true} and {ignore: false} are equivalent
      const shouldIgnore = !propType.compare && propType.ignore !== false;
      return shouldIgnore || value1 === value2;
    }
  },
  data: {
    transform: (value, propType: DataPropType, component) => {
      if (!value) {
        return value;
      }
      const {dataTransform} = component.props;
      if (dataTransform) {
        return dataTransform(value);
      }
      // Detect loaders.gl v4 table format
      if (
        typeof value.shape === 'string' &&
        value.shape.endsWith('-table') &&
        Array.isArray(value.data)
      ) {
        return value.data;
      }
      return value;
    }
  },
  image: {
    transform: (value, propType: ImagePropType, component) => {
      const context = (component as Layer).context;
      if (!context || !context.device) {
        return null;
      }
      return createTexture(component.id, context.device, value, {
        ...propType.parameters,
        ...component.props.textureParameters
      });
    },
    release: (value, propType: ImagePropType, component) => {
      destroyTexture(component.id, value);
    }
  }
} as const;

export function parsePropTypes(propDefs: Record<string, PropTypeDef>): {
  propTypes: Record<string, PropType>;
  defaultProps: Record<string, any>;
  deprecatedProps: Record<string, string[]>;
} {
  const propTypes = {};
  const defaultProps = {};
  const deprecatedProps = {};

  for (const [propName, propDef] of Object.entries(propDefs)) {
    const deprecated = (propDef as DeprecatedProp)?.deprecatedFor;
    if (deprecated) {
      deprecatedProps[propName] = Array.isArray(deprecated) ? deprecated : [deprecated];
    } else {
      const propType = parsePropType(propName, propDef);
      propTypes[propName] = propType;
      defaultProps[propName] = propType.value;
    }
  }
  return {propTypes, defaultProps, deprecatedProps};
}

// Parses one property definition entry. Either contains:
// * a valid prop type object ({type, ...})
// * or just a default value, in which case type and name inference is used
function parsePropType(name: string, propDef: PropTypeDef): PropType {
  switch (getTypeOf(propDef)) {
    case 'object':
      return normalizePropDefinition(name, propDef);

    case 'array':
      return normalizePropDefinition(name, {type: 'array', value: propDef, compare: false});

    case 'boolean':
      return normalizePropDefinition(name, {type: 'boolean', value: propDef});

    case 'number':
      return normalizePropDefinition(name, {type: 'number', value: propDef});

    case 'function':
      // return guessFunctionType(name, propDef);
      return normalizePropDefinition(name, {type: 'function', value: propDef, compare: true});

    default:
      return {name, type: 'unknown', value: propDef};
  }
}

function normalizePropDefinition(name, propDef): PropType {
  if (!('type' in propDef)) {
    if (!('value' in propDef)) {
      // If no type and value this object is likely the value
      return {name, type: 'object', value: propDef};
    }
    return {name, type: getTypeOf(propDef.value), ...propDef};
  }
  return {name, ...TYPE_DEFINITIONS[propDef.type], ...propDef};
}

function isArray(value: any): boolean {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

// improved version of javascript typeof that can distinguish arrays and null values
function getTypeOf(value: any): string {
  if (isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }
  return typeof value;
}
