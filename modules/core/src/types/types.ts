// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

export type {TypedArray, TypedArrayConstructor, NumericArray} from '@math.gl/core';

export interface ConstructorOf<T> {
  new (...args): T;
}
