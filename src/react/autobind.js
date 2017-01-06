/**
 * Binds the "this" argument of all functions on a class instance to the instance
 * @param {Object} obj - class instance (typically a react component)
 */
export default function autobind(obj) {
  const proto = Object.getPrototypeOf(obj);
  const propNames = Object.getOwnPropertyNames(proto);
  for (const key of propNames) {
    if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(obj);
    }
  }
}
