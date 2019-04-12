/* global window */
const isFunction = x => typeof x === 'function';
const isObject = x => x !== null && typeof x === 'object';

export const isPromise = x => isObject(x) && isFunction(x.then);

export const isIterable = x => x && typeof x[Symbol.iterator] === 'function';

export const isAsyncIterable = x => x && typeof x[Symbol.asyncIterator] === 'function';

export const isIterator = x => isObject(x) && 'done' in x && 'value' in x;

export const isFetchResponse = x =>
  (typeof window !== 'undefined' && x instanceof window.Response) ||
  (x.arrayBuffer && x.json && x.body);

export const isReadableDOMStream = x => {
  return (
    isObject(x) &&
    isFunction(x.tee) &&
    isFunction(x.cancel) &&
    isFunction(x.pipeTo) &&
    isFunction(x.getReader)
  );
};
