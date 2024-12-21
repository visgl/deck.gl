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
