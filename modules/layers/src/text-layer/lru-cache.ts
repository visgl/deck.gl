/**
 * LRU Cache class with limit
 *
 * Update order for each get/set operation
 * Delete oldest when reach given limit
 */

export default class LRUCache<ValueT> {
  private limit: number;
  private _cache: Record<string, ValueT> = {};
  /** access/update order, first item is oldest, last item is newest */
  private _order: string[] = [];

  constructor(limit: number = 5) {
    this.limit = limit;
  }

  get(key: string): ValueT {
    const value = this._cache[key];
    if (value) {
      // update order
      this._deleteOrder(key);
      this._appendOrder(key);
    }
    return value;
  }

  set(key: string, value: ValueT): void {
    if (!this._cache[key]) {
      // if reach limit, delete the oldest
      if (Object.keys(this._cache).length === this.limit) {
        this.delete(this._order[0]);
      }

      this._cache[key] = value;
      this._appendOrder(key);
    } else {
      // if found in cache, delete the old one, insert new one to the first of list
      this.delete(key);

      this._cache[key] = value;
      this._appendOrder(key);
    }
  }

  delete(key: string): void {
    const value = this._cache[key];
    if (value) {
      delete this._cache[key];
      this._deleteOrder(key);
    }
  }

  private _deleteOrder(key: string): void {
    const index = this._order.indexOf(key);
    if (index >= 0) {
      this._order.splice(index, 1);
    }
  }

  private _appendOrder(key: string): void {
    this._order.push(key);
  }
}
