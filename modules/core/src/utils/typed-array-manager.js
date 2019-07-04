export class TypedArrayManager {
  constructor({overAlloc = 1, poolSize = 5} = {}) {
    this.overAlloc = overAlloc;
    this.poolSize = poolSize;

    this._pool = {};
  }

  allocate(typedArray, count, {size, type, padding = 0, copy = false}) {
    const newSize = count * size + padding;
    if (typedArray && newSize <= typedArray.length) {
      return typedArray;
    }

    // Allocate at least one element to ensure a valid buffer
    const allocSize = Math.max(Math.ceil(newSize * this.overAlloc), 1);
    const newArray = this._allocate(type, allocSize);

    if (typedArray && copy) {
      newArray.set(typedArray);
    }

    this._release(typedArray);
    return newArray;
  }

  release(typedArray) {
    this._release(typedArray);
  }

  _allocate(Type = Float32Array, size) {
    // Check if available in pool
    const typeName = Type.name;
    const pool = this._pool[typeName];
    if (pool) {
      const i = pool.findIndex(array => array.length >= size);
      if (i >= 0) {
        return pool.splice(i, 1)[0];
      }
    }
    return new Type(size);
  }

  _release(typedArray) {
    if (!typedArray) {
      return;
    }
    const typeName = typedArray.constructor.name;
    let pool = this._pool[typeName];
    if (!pool) {
      pool = [];
      this._pool[typeName] = pool;
    }
    // Save the released array into the pool
    if (pool.length < this.poolSize) {
      pool.push(typedArray);
    } else {
      const i = pool.findIndex(array => array.length < typedArray.length);
      if (i >= 0) {
        pool.splice(i, 1, typedArray);
      }
    }
  }
}

export default new TypedArrayManager({overAlloc: 1.5});
