// Enable classic JavaScript object maps to be used as data

// export function* makeObjectValueIterator(obj) {
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       yield obj[key];
//     }
//   }
// }

// export function addIterator(object) {
//   if (isPlainObject(object) && !object[Symbol.iterator]) {
//     object[Symbol.iterator] = function iterator() {
//       return makeObjectValueIterator(object);
//     };
//   }
// }

export function isPlainObject(o) {
  return o !== null && typeof o === 'object' && o.constructor === Object;
}
