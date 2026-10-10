// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {
  makeStreamingArrowTextSourceAsync,
  TEXT_DATASETS
} from '../../../../examples/arrow/arrow-text-2d/arrow-text-data';

test('dictionary streaming retains every generated label and aligned position', async () => {
  const dataset = TEXT_DATASETS['1m-dict'];
  const source = await makeStreamingArrowTextSourceAsync(dataset, 'constant');
  expect(source.recordBatches.length).toBeGreaterThan(10);
  expect(source.recordBatches.reduce((count, batch) => count + batch.numRows, 0)).toBe(
    dataset.labelCount
  );
  for (const batch of source.recordBatches) {
    expect(batch.getChild('texts')?.length).toBe(batch.numRows);
    expect(batch.getChild('positions')?.length).toBe(batch.numRows);
  }
});
