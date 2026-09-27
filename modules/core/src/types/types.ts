// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import type {
  TypedArray as MathTypedArray,
  TypedArrayConstructor as MathTypedArrayConstructor
} from '@math.gl/types';

export type {NumericArray} from '@math.gl/types';

// Native Float16Array attributes are not supported yet. Preserve deck.gl's existing public types
// while allowing math.gl's broader NumericArray type for general numeric inputs.
export type TypedArray = Exclude<MathTypedArray, Float16Array>;
export type TypedArrayConstructor = Exclude<MathTypedArrayConstructor, Float16ArrayConstructor>;

export interface ConstructorOf<T> {
  new (...args): T;
}
