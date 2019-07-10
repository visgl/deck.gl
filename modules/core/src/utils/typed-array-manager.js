export class TypedArrayManager {
  constructor({overAlloc = 1, poolSize = 100} = {}) {
    this.overAlloc = overAlloc;
    this.poolSize = poolSize;

    this._pool = [];
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
    } else {
      // Hack - viewing a buffer with a different type may create NaNs
      // which crashes the Attribute validation
      newArray.fill(0, 0, 4);
    }

    this._release(typedArray);
    return newArray;
  }

  release(typedArray) {
    this._release(typedArray);
  }

  _allocate(Type = Float32Array, size) {
    // Check if available in pool
    const pool = this._pool;
    const byteLength = Type.BYTES_PER_ELEMENT * size;
    const i = pool.findIndex(b => b.byteLength >= byteLength);
    if (i >= 0) {
      // Create a new array using an existing buffer
      return new Type(pool.splice(i, 1)[0], 0, size);
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

export default new TypedArrayManager({overAlloc: 1.5});
