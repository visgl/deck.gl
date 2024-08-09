// deck.gl, MIT license

export type {TypedArray, TypedArrayConstructor, NumericArray} from '@math.gl/types';

export interface ConstructorOf<T> {
  new (...args): T;
}
