export {TypedArray, TypedArrayConstructor, NumberArray as NumericArray} from '@luma.gl/api';
export interface ConstructorOf<T> {
  new (...args: any[]): T;
}
import {ShaderModule as _ShaderModule} from '@luma.gl/shadertools';
export declare type ShaderModule<SettingsT = any> = _ShaderModule & {
  passes?: {
    sampler?: string | boolean;
    filter?: boolean;
    uniforms?: Record<string, any>;
  }[];
};
// # sourceMappingURL=types.d.ts.map
