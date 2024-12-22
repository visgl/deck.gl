/**
 * LRU Cache class with limit
 *
 * Update order for each get/set operation
 * Delete oldest when reach given limit
 */
export default class LRUCache<ValueT> {
  private limit;
  private _cache;
  /** access/update order, first item is oldest, last item is newest */
  private _order;
  constructor(limit?: number);
  get(key: string): ValueT;
  set(key: string, value: ValueT): void;
  delete(key: string): void;
  private _deleteOrder;
  private _appendOrder;
}
// # sourceMappingURL=lru-cache.d.ts.map
