import type Component from './component';
import type {Color, Texture} from '../types/layer-props';
declare type BasePropType<ValueT> = {
  value: ValueT;
  async?: boolean;
  validate?: (value: any, propType: PropType) => boolean;
  equal?: (value1: ValueT, value2: ValueT, propType: PropType) => boolean;
};
/**
 * Normalized prop type definition
 */
export declare type PropType = BasePropType<any> & {
  type: string;
  name: string;
  transform?: (value: any, propType: PropType, component: Component<any>) => any;
  release?: (value: any, propType: PropType, component: Component<any>) => void;
};
declare type DefaultProp<T> =
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
export declare type DefaultProps<T extends Record<string, any>> = {
  [propName in keyof T]?: DefaultProp<Required<T>[propName]>;
};
declare type BooleanPropType = BasePropType<boolean> & {
  type: 'boolean';
};
declare type NumberPropType = BasePropType<number> & {
  type: 'number';
  min?: number;
  max?: number;
};
declare type ColorPropType = BasePropType<Color | null> & {
  type: 'color';
  optional?: boolean;
};
declare type ArrayPropType<T = any[]> = BasePropType<T> & {
  type: 'array';
  optional?: boolean;
  compare?: boolean;
};
declare type AccessorPropType<T = any> = BasePropType<T> & {
  type: 'accessor';
};
declare type FunctionPropType<T = Function> = BasePropType<T> & {
  type: 'function';
  optional?: boolean;
  compare?: boolean;
};
declare type DataPropType<T = any> = BasePropType<T> & {
  type: 'data';
};
declare type ImagePropType = BasePropType<Texture | null> & {
  type: 'image';
};
declare type ObjectPropType<T = any> = BasePropType<T> & {
  type: 'object';
  optional?: boolean;
  compare?: boolean;
};
declare type DeprecatedProp = {
  deprecatedFor?: string | string[];
};
declare type PropTypeDef =
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
export declare function parsePropTypes(propDefs: Record<string, PropTypeDef>): {
  propTypes: Record<string, PropType>;
  defaultProps: Record<string, any>;
  deprecatedProps: Record<string, string[]>;
};
export {};
// # sourceMappingURL=prop-types.d.ts.map
