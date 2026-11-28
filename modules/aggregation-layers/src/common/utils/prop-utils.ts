// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export function filterProps(props, filterKeys) {
  const filteredProps = {};
  for (const key in props) {
    if (!filterKeys.includes(key)) {
      filteredProps[key] = props[key];
    }
  }
  return filteredProps;
}

// Keep plain uniform values by value, but retain resource identity and revision.
export function snapshotUniformProps(value: any, depth = 4): any {
  if (!value || typeof value !== 'object' || depth === 0) return value;
  if (Array.isArray(value) || ArrayBuffer.isView(value))
    return Array.from(value as ArrayLike<unknown>);
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return typeof value.updateTimestamp === 'number'
      ? {resource: value, revision: value.updateTimestamp}
      : value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, snapshotUniformProps(entry, depth - 1)])
  );
}
