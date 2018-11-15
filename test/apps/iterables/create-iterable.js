/* global Proxy, Symbol */
export default function createIterable({source, length, get}) {
  const iterator = () => ({
    next: function next() {
      if (this.index < length) {
        const value = get(source, this.index);
        this.index++;
        return {value, done: false};
      }
      return {done: true};
    },
    index: 0
  });

  return new Proxy(
    {},
    {
      get: (obj, prop) => {
        if (isFinite(prop) && prop !== null) {
          return get(source, prop);
        }
        if (prop === 'length') {
          return length;
        }
        if (prop === Symbol.iterator) {
          return iterator;
        }
        return source[prop];
      }
    }
  );
}
