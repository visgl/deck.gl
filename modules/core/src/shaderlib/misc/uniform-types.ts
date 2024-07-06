type UniformProps = {
  [name: string]: number | boolean | number[];
};

type NumArray2 = [number, number];
type NumArray3 = [number, number, number];
type NumArray4 = [number, number, number, number];
type NumArray6 = [number, number, number, number, number, number];
type NumArray8 = [number, number, number, number, number, number, number, number];
type NumArray9 = [number, number, number, number, number, number, number, number, number];
type NumArray12 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
type NumArray16 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type UniformType<ValueT extends number | boolean | number[]> = ValueT extends number | boolean
  ? 'f32' | 'i32' | 'u32'
  : ValueT extends NumArray2
  ? 'vec2<f32>' | 'vec2<i32>' | 'vec2<u32>'
  : ValueT extends NumArray3
  ? 'vec3<f32>' | 'vec3<i32>' | 'vec3<u32>'
  : ValueT extends NumArray4
  ? 'vec4<f32>' | 'vec4<i32>' | 'vec4<u32>' | 'mat2x2<f32>'
  : ValueT extends NumArray6
  ? 'mat2x3<f32>' | 'mat3x2<f32>'
  : ValueT extends NumArray8
  ? 'mat2x4<f32>' | 'mat4x2<f32>'
  : ValueT extends NumArray9
  ? 'mat3x3<f32>'
  : ValueT extends NumArray12
  ? 'mat3x4<f32>' | 'mat4x3<f32>'
  : ValueT extends NumArray16
  ? 'mat4x4<f32>'
  : never;

export type UniformTypes<PropsT extends UniformProps> = {
  [name in keyof PropsT]: UniformType<PropsT[name]>;
};
