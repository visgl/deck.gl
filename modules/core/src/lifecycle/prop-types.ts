import {createTexture, destroyTexture} from '../utils/texture';
import {deepEqual} from '../utils/deep-equal';

import type Component from './component';
import type {Color, Texture} from '../types/layer-props';

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

export type DefaultProps<T extends Record<string, any>> = {
  [propName in keyof T]?: DefaultProp<Required<T>[propName]>;
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
  compare?: boolean;
};
type AccessorPropType<T = any> = BasePropType<T> & {
  type: 'accessor';
};
type FunctionPropType<T = Function> = BasePropType<T> & {
  type: 'function';
  optional?: boolean;
  compare?: boolean;
};
type DataPropType<T = any> = BasePropType<T> & {
  type: 'data';
};
type ImagePropType = BasePropType<Texture | null> & {
  type: 'image';
};
type ObjectPropType<T = any> = BasePropType<T> & {
  type: 'object';
  optional?: boolean;
  compare?: boolean;
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
      return arrayEqual(value1, value2);
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
      return arrayEqual(value1, value2);
    }
  },
  array: {
    validate(value, propType: ArrayPropType) {
      return (propType.optional && !value) || isArray(value);
    },
    equal(value1, value2, propType: ArrayPropType) {
      return propType.compare ? arrayEqual(value1, value2) : value1 === value2;
    }
  },
  object: {
    equal(value1, value2, propType: ObjectPropType) {
      return propType.compare ? deepEqual(value1, value2) : value1 === value2;
    }
  },
  function: {
    validate(value, propType: FunctionPropType) {
      return (propType.optional && !value) || typeof value === 'function';
    },
    equal(value1, value2, propType: FunctionPropType) {
      return !propType.compare || value1 === value2;
    }
  },
  data: {
    transform: (value, propType: DataPropType, component) => {
      const {dataTransform} = component.props;
      return dataTransform && value ? dataTransform(value) : value;
    }
  },
  image: {
    transform: (value, propType: ImagePropType, component) => {
      return createTexture(component, value);
    },
    release: value => {
      destroyTexture(value);
    }
  }
} as const;

function arrayEqual(array1, array2) {
  if (array1 === array2) {
    return true;
  }
  if (!isArray(array1) || !isArray(array2)) {
    return false;
  }
  const len = array1.length;
  if (len !== array2.length) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

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
