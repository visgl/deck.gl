// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * LRU Cache class with limit
 *
 * Update order for each get/set operation
 * Delete oldest when reach given limit
 */
export default class LRUCache {
    constructor(limit = 5) {
        this._cache = {};
        /** access/update order, first item is oldest, last item is newest */
        this._order = [];
        this.limit = limit;
    }
    get(key) {
        const value = this._cache[key];
        if (value) {
            // update order
            this._deleteOrder(key);
            this._appendOrder(key);
        }
        return value;
    }
    set(key, value) {
        if (!this._cache[key]) {
            // if reach limit, delete the oldest
            if (Object.keys(this._cache).length === this.limit) {
                this.delete(this._order[0]);
            }
            this._cache[key] = value;
            this._appendOrder(key);
        }
        else {
            // if found in cache, delete the old one, insert new one to the first of list
            this.delete(key);
            this._cache[key] = value;
            this._appendOrder(key);
        }
    }
    delete(key) {
        const value = this._cache[key];
        if (value) {
            delete this._cache[key];
            this._deleteOrder(key);
        }
    }
    _deleteOrder(key) {
        const index = this._order.indexOf(key);
        if (index >= 0) {
            this._order.splice(index, 1);
        }
    }
    _appendOrder(key) {
        this._order.push(key);
    }
}
//# sourceMappingURL=lru-cache.js.map