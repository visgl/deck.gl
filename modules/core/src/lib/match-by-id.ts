// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import log from '../utils/log';

/** How an entry of a new list pairs with the entries of the old list. */
export type IdMatch<T> = {
  /** The entry from the new list. */
  item: T;
  /** The first entry in the old list with the same id, if any. */
  previous: T | undefined;
  /** An earlier entry in the new list has the same id. */
  duplicate: boolean;
};

/**
 * Pairs the entries of a new list with those of an old list by id.
 *
 * The first new entry with an id is matched with the first old entry with that id. Each later new
 * entry with the same id is a duplicate. The caller decides what to do with each match.
 *
 * @example
 * const {matches, removed} = matchById(
 *   [{id: 'a'}, {id: 'b', version: 1}],
 *   [{id: 'b', version: 2}, {id: 'c'}, {id: 'c'}]
 * );
 * // matches[0]: the new 'b', with the old 'b' as `previous`
 * // matches[1]: the first 'c', with no `previous`
 * // matches[2]: the second 'c', a duplicate
 * // removed: [{id: 'a'}]
 *
 * @param oldItems the entries from the previous update
 * @param newItems the entries for this update
 * @param kind the plural noun for the duplicate warning, such as `'widgets'`. Omit it to skip the warning.
 * @returns a match for each new entry, in order, and the old entries whose id is not in the new list.
 *   An old entry that repeats an earlier old entry's id is never a `previous`, and is in `removed`
 *   only once its id is gone, so a caller that holds resources per old entry must release those
 *   duplicates itself.
 */
export function matchById<T extends {id: string}>(
  oldItems: readonly T[],
  newItems: readonly T[],
  kind?: string
): {matches: IdMatch<T>[]; removed: T[]} {
  const oldById = new Map<string, T>();
  for (const item of oldItems) {
    if (!oldById.has(item.id)) {
      oldById.set(item.id, item);
    }
  }

  const newIds = new Set<string>();
  const matches = newItems.map(item => {
    const duplicate = newIds.has(item.id);
    newIds.add(item.id);
    return {item, previous: oldById.get(item.id), duplicate};
  });
  if (kind) {
    warnDuplicates(matches, kind);
  }

  const removed = oldItems.filter(item => !newIds.has(item.id));
  return {matches, removed};
}

/** Warns about each duplicate in the result of `matchById`. */
export function warnDuplicates<T extends {id: string}>(matches: IdMatch<T>[], kind: string): void {
  for (const {item, duplicate} of matches) {
    if (duplicate) {
      log.warn(`Multiple ${kind} with same id ${item.id}`)();
    }
  }
}
