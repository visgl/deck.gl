export function isDefined(value: any) {
  return typeof value !== 'undefined';
}

export function isFn(a: any): a is Function {
  return typeof a === 'function';
}

// eslint-disable-next-line
const performanceNow = isDefined(performance) && isFn(performance.now) && performance.now;
const dateNow = isFn(Date.now) && Date.now;
const fallbackNow = () => 0;

export const now = performanceNow || dateNow || fallbackNow;
