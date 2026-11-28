// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Table} from 'apache-arrow';

/** Identifies a strict append to an existing Arrow batch sequence. */
export function isArrowTableAppend(previous: Table, current: Table): boolean {
  return (
    previous.batches.length < current.batches.length &&
    previous.batches.every((batch, index) => current.batches[index] === batch)
  );
}
