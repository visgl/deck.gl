// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const ERR_NOT_OBJECT = 'count(): argument not an object';
const ERR_NOT_CONTAINER = 'count(): argument not a container';
/**
 * Deduces numer of elements in a JavaScript container.
 * - Auto-deduction for ES6 containers that define a count() method
 * - Auto-deduction for ES6 containers that define a size member
 * - Auto-deduction for Classic Arrays via the built-in length attribute
 * - Also handles objects, although note that this an O(N) operation
 */
export function count(container) {
    if (!isObject(container)) {
        throw new Error(ERR_NOT_OBJECT);
    }
    // Check if ES6 collection "count" function is available
    if (typeof container.count === 'function') {
        return container.count();
    }
    // Check if ES6 collection "size" attribute is set
    if (Number.isFinite(container.size)) {
        return container.size;
    }
    // Check if array length attribute is set
    // Note: checking this last since some ES6 collections (Immutable.js)
    // emit profuse warnings when trying to access `length` attribute
    if (Number.isFinite(container.length)) {
        return container.length;
    }
    // Note that getting the count of an object is O(N)
    if (isPlainObject(container)) {
        return Object.keys(container).length;
    }
    throw new Error(ERR_NOT_CONTAINER);
}
/**
 * Checks if argument is a plain object (not a class or array etc)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a plain JavaScript object
 */
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && value.constructor === Object;
}
/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
function isObject(value) {
    return value !== null && typeof value === 'object';
}
//# sourceMappingURL=count.js.map