// deck.gl, MIT license

export {TypedArray, TypedArrayConstructor, NumberArray as NumericArray} from '@luma.gl/core';

export interface ConstructorOf<T> {
  new (...args): T;
}
