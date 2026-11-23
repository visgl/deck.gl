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
  /** An earlier entry in the new list has the same id. Only the first entry with an id is managed. */
  duplicate: boolean;
};

/**
 * Pairs the entries of a new list with those of an old list by id. `WidgetManager` and
 * `ViewManager` use it to carry widgets, views and their controllers across updates.
 *
 * The id is the identity. The first new entry with an id is matched with the first old entry
 * with that id; each later new entry with the same id is a duplicate. Whether a matched entry is
 * reused is up to the caller: a widget is reused when its class default id, `viewId` and
 * `placement` are unchanged, and a view when it `equals` the old one.
 *
 * @param oldItems the entries from the previous update
 * @param newItems the entries for this update
 * @param kind the plural noun for the duplicate warning, such as `'widgets'`. Omit it to skip the warning.
 * @returns a match for each new entry, in order, and the old entries whose id is not in the new list
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
    if (duplicate && kind) {
      log.warn(`Multiple ${kind} with same id ${item.id}`)();
    }
    newIds.add(item.id);
    return {item, previous: oldById.get(item.id), duplicate};
  });

  const removed = oldItems.filter(item => !newIds.has(item.id));
  return {matches, removed};
}
