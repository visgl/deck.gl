export class TypedArrayManager {
  constructor({overAlloc = 2, poolSize = 100} = {}) {
    this.overAlloc = overAlloc;
    this.poolSize = poolSize;

    this._pool = [];
  }

  allocate(typedArray, count, {size = 1, type, padding = 0, copy = false, initialize = false}) {
    const Type = type || (typedArray && typedArray.constructor) || Float32Array;

    const newSize = count * size + padding;
    if (ArrayBuffer.isView(typedArray)) {
      if (newSize <= typedArray.length) {
        return typedArray;
      }
      if (newSize * typedArray.BYTES_PER_ELEMENT <= typedArray.buffer.byteLength) {
        return new Type(typedArray.buffer, 0, newSize);
      }
    }

    const newArray = this._allocate(Type, newSize, initialize);

    if (typedArray && copy) {
      newArray.set(typedArray);
    } else if (!initialize) {
      // Hack - always initialize the first 4 elements. NaNs crashe the Attribute validation
      newArray.fill(0, 0, 4);
    }

    this._release(typedArray);
    return newArray;
  }

  release(typedArray) {
    this._release(typedArray);
  }

  _allocate(Type, size, initialize) {
    // Allocate at least one element to ensure a valid buffer
    size = Math.max(Math.ceil(size * this.overAlloc), 1);

    // Check if available in pool
    const pool = this._pool;
    const byteLength = Type.BYTES_PER_ELEMENT * size;
    const i = pool.findIndex(b => b.byteLength >= byteLength);
    if (i >= 0) {
      // Create a new array using an existing buffer
      const array = new Type(pool.splice(i, 1)[0], 0, size);
      if (initialize) {
        // Viewing a buffer with a different type may create NaNs
        array.fill(0);
      }
      return array;
    }
    return new Type(size);
  }

  _release(typedArray) {
    if (!ArrayBuffer.isView(typedArray)) {
      return;
    }
    const pool = this._pool;
    const {buffer} = typedArray;
    // Save the buffer of the released array into the pool
    // Sort buffers by size
    // TODO - implement binary search?
    const {byteLength} = buffer;
    const i = pool.findIndex(b => b.byteLength >= byteLength);
    if (i < 0) {
      pool.push(buffer);
    } else if (i > 0 || pool.length < this.poolSize) {
      pool.splice(i, 0, buffer);
    }
    if (pool.length > this.poolSize) {
      // Drop the smallest one
      pool.shift();
    }
  }
}

export default new TypedArrayManager();
