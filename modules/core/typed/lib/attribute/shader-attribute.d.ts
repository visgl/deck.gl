import type DataColumn from './data-column';
import type {BufferAccessor, ShaderAttributeOptions} from './data-column';
import type {Buffer} from '@luma.gl/webgl-legacy';
import type {NumericArray} from '../../types/types';
export interface IShaderAttribute {
  value: NumericArray | null;
  getValue(): [Buffer, BufferAccessor] | NumericArray | null;
}
export default class ShaderAttribute implements IShaderAttribute {
  opts: ShaderAttributeOptions;
  source: DataColumn<any, any>;
  constructor(dataColumn: DataColumn<any, any>, opts: ShaderAttributeOptions);
  get value(): NumericArray | null;
  getValue(): [Buffer, BufferAccessor] | NumericArray | null;
  getAccessor(): any;
}
// # sourceMappingURL=shader-attribute.d.ts.map
