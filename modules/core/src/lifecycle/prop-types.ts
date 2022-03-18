import {createTexture, destroyTexture} from '../utils/texture';

import type Component from './component';

type BasePropType = {
  value: any;
  async?: boolean;
  validate?: (value: any, propType: PropType) => boolean;
  equal?: (value1: any, value2: any, propType: PropType) => boolean;
};

/**
 * Normalized prop type definition
 */
export type PropType = BasePropType & {
  type: string;
  name: string;
  transform?: (value: any, propType: PropType, component: Component<any>) => any;
  release?: (value: any, propType: PropType, component: Component<any>) => void;
};

type BooleanPropType = BasePropType & {
  type: 'boolean';
  value: boolean;
};
type NumberPropType = BasePropType & {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
};
type ColorPropType = BasePropType & {
  type: 'color';
  value: [number, number, number, number];
  optional?: boolean;
};
type ArrayPropType = BasePropType & {
  type: 'array';
  value: any[];
  optional?: boolean;
  compare?: boolean;
};
type AccessorPropType = BasePropType & {
  type: 'accessor';
};
type FunctionPropType = BasePropType & {
  type: 'function';
  value: Function;
  optional?: boolean;
  compare?: boolean;
};
type DataPropType = BasePropType & {
  type: 'data';
};
type ImagePropType = BasePropType & {
  type: 'image';
};
type ObjectPropType = BasePropType & {
  type: 'object';
  optional?: boolean;
  compare?: boolean;
};
type DeprecatedProp = {
  deprecatedFor?: string | string[];
};
export type PropTypeDef =
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
      return propType.compare ? objectEqual(value1, value2) : value1 === value2;
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

function objectEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (!isObject(object1) || !isObject(object2)) {
    return false;
  }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (!arrayEqual(keys1, keys2)) {
    return false;
  }
  for (const key of keys1) {
    const value1 = object1[key];
    const value2 = object2[key];
    if (isObject(value1) && !objectEqual(value1, value2)) {
      return false;
    }
    if (isArray(value1) && !arrayEqual(value1, value2)) {
      return false;
    }
    if (value1 !== value2) {
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

function isObject(value: any): boolean {
  return getTypeOf(value) === 'object';
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
